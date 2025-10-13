// controllers/homeController.js
const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Review = require("../models/Review");

exports.getHomeData = async (req, res) => {
  try {
    const { lang = "en" } = req.query;

    // Execute all database queries in parallel
    const [
      platformStats,
      categories,
      featuredCourses,
      popularCourses,
      newCourses,
      topInstructors,
      testimonials,
      trendingSkills,
    ] = await Promise.all([
      getPlatformStats(),
      getCategories(lang),
      getFeaturedCourses(lang),
      getPopularCourses(lang),
      getNewCourses(lang),
      getTopInstructors(lang),
      getTestimonials(lang),
      getTrendingSkills(),
    ]);

    // Get localized static data
    const features = getFeaturesData(lang);
    const pricingPlans = getPricingData(lang);
    const faqs = getFAQData(lang);

    const homeData = {
      hero: {
        stats: platformStats,
        trendingSkills: trendingSkills,
        headlines: getHeadlines(lang),
      },
      categories,
      courses: {
        featured: featuredCourses,
        popular: popularCourses,
        new: newCourses,
      },
      instructors: topInstructors,
      testimonials,
      features,
      pricing: pricingPlans,
      faqs,
    };

    res.json({
      success: true,
      data: homeData,
      language: lang,
    });
  } catch (error) {
    console.error("Home data error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load home data",
    });
  }
};

// Helper functions with language support
async function getPlatformStats() {
  const [
    totalStudents,
    totalCourses,
    totalInstructors,
    enrollmentStats,
    recentEnrollments,
  ] = await Promise.all([
    User.countDocuments({ role: "student", isActive: true }),
    Course.countDocuments({ status: "published", isPublished: true }),
    User.countDocuments({ role: "instructor", isActive: true }),
    Enrollment.aggregate([
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          completedEnrollments: {
            $sum: { $cond: [{ $eq: ["$progress", 100] }, 1, 0] },
          },
        },
      },
    ]),
    Enrollment.countDocuments({
      enrolledAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),
  ]);

  const enrollmentData = enrollmentStats[0] || {};
  const successRate =
    enrollmentData.totalEnrollments > 0
      ? Math.round(
          (enrollmentData.completedEnrollments /
            enrollmentData.totalEnrollments) *
            100
        )
      : 0;

  return {
    totalStudents,
    totalCourses,
    totalInstructors,
    successRate,
    totalEnrollments: enrollmentData.totalEnrollments || 0,
    dailyEnrollments: recentEnrollments,
  };
}

async function getCategories(lang) {
  const categories = await Course.aggregate([
    { $match: { status: "published", isPublished: true } },
    {
      $group: {
        _id: "$category",
        courseCount: { $sum: 1 },
        totalStudents: { $sum: "$studentsEnrolled" },
        avgRating: { $avg: "$ratings.average" },
      },
    },
    {
      $project: {
        _id: 1,
        courseCount: 1,
        totalStudents: 1,
        avgRating: { $round: ["$avgRating", 1] },
      },
    },
    { $sort: { courseCount: -1 } },
    { $limit: 10 },
  ]);

  // Localize category names
  const categoryTranslations = {
    en: {
      Development: "Development",
      Design: "Design",
      Business: "Business",
      Marketing: "Marketing",
      Photography: "Photography",
      Music: "Music",
      "Data Science": "Data Science",
      "Personal Development": "Personal Development",
    },
    ar: {
      Development: "التطوير",
      Design: "التصميم",
      Business: "الأعمال",
      Marketing: "التسويق",
      Photography: "التصوير",
      Music: "الموسيقى",
      "Data Science": "علم البيانات",
      "Personal Development": "التنمية الشخصية",
    },
  };

  return categories.map((cat) => ({
    id: cat._id,
    name: categoryTranslations[lang]?.[cat._id] || cat._id,
    courseCount: cat.courseCount,
    totalStudents: cat.totalStudents,
    avgRating: cat.avgRating || 0,
    icon: getCategoryIcon(cat._id),
  }));
}

function getCategoryIcon(category) {
  const icons = {
    Development: "💻",
    Design: "🎨",
    Business: "💼",
    Marketing: "📈",
    Photography: "📸",
    Music: "🎵",
    "Data Science": "📊",
    "Personal Development": "🧠",
  };
  return icons[category] || "📚";
}

async function getFeaturedCourses(lang) {
  const courses = await Course.find({
    status: "published",
    isPublished: true,
    isFeatured: true,
  })
    .populate("instructor", "name avatar expertise")
    .select(
      "title subtitle image price ratings studentsEnrolled level category slug totalHours lecturesCount isFeatured createdAt"
    )
    .sort({ "ratings.average": -1, studentsEnrolled: -1 })
    .limit(8)
    .lean();

  return processCourses(courses, lang);
}

async function getPopularCourses(lang) {
  const courses = await Course.find({
    status: "published",
    isPublished: true,
  })
    .populate("instructor", "name avatar expertise")
    .select(
      "title subtitle image price ratings studentsEnrolled level category slug totalHours lecturesCount createdAt"
    )
    .sort({ studentsEnrolled: -1, "ratings.average": -1 })
    .limit(12)
    .lean();

  return processCourses(courses, lang);
}

async function getNewCourses(lang) {
  const courses = await Course.find({
    status: "published",
    isPublished: true,
    publishedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  })
    .populate("instructor", "name avatar expertise")
    .select(
      "title subtitle image price ratings studentsEnrolled level category slug totalHours lecturesCount createdAt"
    )
    .sort({ publishedAt: -1 })
    .limit(8)
    .lean();

  return processCourses(courses, lang);
}

async function getTopInstructors(lang) {
  const instructors = await User.find({
    role: "instructor",
    isActive: true,
    "instructorStats.totalCourses": { $gt: 0 },
  })
    .select("name avatar bio expertise instructorStats")
    .sort({
      "instructorStats.totalStudents": -1,
      "instructorStats.averageRating": -1,
    })
    .limit(8)
    .lean();

  return instructors.map((instructor) => ({
    id: instructor._id,
    name: instructor.name,
    avatar: instructor.avatar,
    bio:
      lang === "ar"
        ? "مدرب محترف مع سنوات من الخبرة"
        : instructor.bio || "Professional instructor with years of experience",
    expertise: instructor.expertise || [],
    stats: instructor.instructorStats || {},
  }));
}

async function getTestimonials(lang) {
  const testimonials = await Review.find({
    rating: { $gte: 4 },
    comment: { $exists: true, $ne: "" },
  })
    .populate("user", "name avatar")
    .populate("course", "title category")
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  // Add localized comments for demo
  const localizedComments = {
    en: [
      "This course completely transformed my career!",
      "Excellent content and great instructor support.",
      "Best investment I've made in my education.",
      "The practical projects were incredibly valuable.",
      "Well-structured and easy to follow.",
      "Highly recommended for beginners and experts alike.",
    ],
    ar: [
      "هذه الدورة غيرت مساري المهني بالكامل!",
      "محتوى ممتاز ودعم رائع من المدرب.",
      "أفضل استثمار قمت به في تعليمي.",
      "المشاريع العملية كانت قيمة بشكل لا يصدق.",
      "منظمة بشكل جيل وسهلة المتابعة.",
      "موصى بها بشدة للمبتدئين والخبراء على حد سواء.",
    ],
  };

  return testimonials.map((testimonial, index) => ({
    id: testimonial._id,
    user: testimonial.user
      ? {
          id: testimonial.user._id,
          name: testimonial.user.name,
          avatar: testimonial.user.avatar,
        }
      : null,
    course: testimonial.course
      ? {
          id: testimonial.course._id,
          title: testimonial.course.title,
          category: testimonial.course.category,
        }
      : null,
    rating: testimonial.rating,
    comment: localizedComments[lang]?.[index] || testimonial.comment,
    createdAt: testimonial.createdAt,
  }));
}

async function getTrendingSkills() {
  const skills = await Course.aggregate([
    { $match: { status: "published", isPublished: true } },
    { $unwind: "$whatYoullLearn" },
    {
      $group: {
        _id: "$whatYoullLearn",
        courseCount: { $sum: 1 },
        totalStudents: { $sum: "$studentsEnrolled" },
      },
    },
    { $sort: { totalStudents: -1, courseCount: -1 } },
    { $limit: 8 },
  ]);

  return skills.map((skill) => ({
    skill: skill._id,
    courseCount: skill.courseCount,
    totalStudents: skill.totalStudents,
  }));
}

function processCourses(courses, lang) {
  // Localize course levels
  const levelTranslations = {
    en: {
      Beginner: "Beginner",
      Intermediate: "Intermediate",
      Advanced: "Advanced",
    },
    ar: {
      Beginner: "مبتدئ",
      Intermediate: "متوسط",
      Advanced: "متقدم",
    },
  };

  return courses.map((course) => ({
    id: course._id,
    title: course.title,
    subtitle: course.subtitle,
    image: course.image,
    price: course.price,
    ratings: course.ratings,
    studentsEnrolled: course.studentsEnrolled,
    level: levelTranslations[lang]?.[course.level] || course.level,
    category: course.category,
    slug: course.slug,
    totalHours: course.totalHours,
    lecturesCount: course.lecturesCount,
    instructor: course.instructor
      ? {
          id: course.instructor._id,
          name: course.instructor.name,
          avatar: course.instructor.avatar,
          expertise: course.instructor.expertise || [],
        }
      : null,
    createdAt: course.createdAt,
    isFeatured: course.isFeatured,
  }));
}

// Localized static data
function getHeadlines(lang) {
  const headlines = {
    en: [
      "Learn from industry experts",
      "Advance your career with new skills",
      "Transform your future through learning",
      "Master in-demand skills today",
    ],
    ar: [
      "تعلم من خبراء الصناعة",
      "طور مسارك المهني بمهارات جديدة",
      "حول مستقبلك من خلال التعلم",
      "اتقن المهارات المطلوبة اليوم",
    ],
  };
  return headlines[lang] || headlines.en;
}

function getFeaturesData(lang) {
  const features = {
    en: [
      {
        icon: "🎯",
        title: "Expert-Led Courses",
        description:
          "Learn from industry professionals with years of real-world experience",
      },
      {
        icon: "📚",
        title: "Comprehensive Library",
        description:
          "Access thousands of courses across all major categories and skill levels",
      },
      {
        icon: "💻",
        title: "Learn Anywhere",
        description:
          "Full mobile support - learn on your phone, tablet, or computer",
      },
      {
        icon: "🏆",
        title: "Career Certificates",
        description:
          "Earn industry-recognized certificates to boost your career",
      },
      {
        icon: "🔄",
        title: "Lifetime Access",
        description:
          "Once you enroll, you get lifetime access to all course materials",
      },
      {
        icon: "👥",
        title: "Community Learning",
        description:
          "Join discussions and learn together with millions of students",
      },
    ],
    ar: [
      {
        icon: "🎯",
        title: "دورات بقيادة الخبراء",
        description: "تعلم من محترفين في الصناعة مع سنوات من الخبرة العملية",
      },
      {
        icon: "📚",
        title: "مكتبة شاملة",
        description:
          "الوصول إلى آلاف الدورات في جميع الفئات والمستويات الرئيسية",
      },
      {
        icon: "💻",
        title: "تعلم في أي مكان",
        description:
          "دعم كامل للجوال - تعلم على هاتفك أو جهازك اللوحي أو حاسوبك",
      },
      {
        icon: "🏆",
        title: "شهادات مهنية",
        description: "احصل على شهادات معترف بها في الصناعة لتعزيز مسارك المهني",
      },
      {
        icon: "🔄",
        title: "وصول مدى الحياة",
        description:
          "بمجرد التسجيل، تحصل على وصول مدى الحياة لجميع مواد الدورة",
      },
      {
        icon: "👥",
        title: "التعلم المجتمعي",
        description: "انضم إلى المناقشات وتعلم معًا مع ملايين الطلاب",
      },
    ],
  };
  return features[lang] || features.en;
}

function getPricingData(lang) {
  const pricing = {
    en: [
      {
        name: "Free",
        description: "Perfect for getting started",
        price: 0,
        period: "forever",
        currency: "USD",
        features: [
          "Access to free courses",
          "Community support",
          "Basic learning resources",
          "Mobile app access",
        ],
        isPopular: false,
        trialDays: 0,
        maxStudents: 1,
      },
      {
        name: "Pro",
        description: "Most popular choice",
        price: 19.99,
        period: "month",
        currency: "USD",
        features: [
          "All free features",
          "Access to all premium courses",
          "Certificate of completion",
          "Downloadable resources",
          "Priority support",
          "Offline access",
        ],
        isPopular: true,
        trialDays: 7,
        maxStudents: 1,
      },
      {
        name: "Team",
        description: "For teams and organizations",
        price: 49.99,
        period: "month",
        currency: "USD",
        features: [
          "All Pro features",
          "Up to 5 team members",
          "Advanced progress tracking",
          "Team analytics dashboard",
          "Custom learning paths",
          "Dedicated account manager",
        ],
        isPopular: false,
        trialDays: 14,
        maxStudents: 5,
      },
    ],
    ar: [
      {
        name: "مجاني",
        description: "مثالي للبدء",
        price: 0,
        period: "مدى الحياة",
        currency: "USD",
        features: [
          "الوصول إلى الدورات المجانية",
          "دعم المجتمع",
          "موارد تعليمية أساسية",
          "الوصول لتطبيق الجوال",
        ],
        isPopular: false,
        trialDays: 0,
        maxStudents: 1,
      },
      {
        name: "المحترف",
        description: "الخيار الأكثر شيوعًا",
        price: 19.99,
        period: "شهر",
        currency: "USD",
        features: [
          "جميع الميزات المجانية",
          "الوصول لجميع الدورات المميزة",
          "شهادة إتمام",
          "موارد قابلة للتحميل",
          "دعم متميز",
          "وصول دون اتصال",
        ],
        isPopular: true,
        trialDays: 7,
        maxStudents: 1,
      },
      {
        name: "الفريق",
        description: "للفرق والمؤسسات",
        price: 49.99,
        period: "شهر",
        currency: "USD",
        features: [
          "جميع ميزات المحترف",
          "حتى 5 أعضاء في الفريق",
          "تتبع تقدم متقدم",
          "لوحة تحليلات الفريق",
          "مسارات تعلم مخصصة",
          "مدرب حسابات مخصص",
        ],
        isPopular: false,
        trialDays: 14,
        maxStudents: 5,
      },
    ],
  };
  return pricing[lang] || pricing.en;
}

function getFAQData(lang) {
  const faqs = {
    en: [
      {
        question: "How do I choose the right course for my skill level?",
        answer:
          "Each course clearly indicates its difficulty level (Beginner, Intermediate, Advanced). You can also read reviews from students with similar backgrounds and watch course previews to assess if it matches your skill level.",
      },
      {
        question: "Can I learn at my own pace?",
        answer:
          "Absolutely! All courses are self-paced with lifetime access. You can complete them on your schedule, pause and resume anytime, and revisit materials whenever you need.",
      },
      {
        question: "Do I receive a certificate after completing a course?",
        answer:
          "Yes, for all paid courses you'll receive a verifiable certificate of completion that you can share on LinkedIn, include in your resume, or showcase to employers.",
      },
      {
        question: "What if I'm not satisfied with a course?",
        answer:
          "We offer a 30-day money-back guarantee for all courses. If you're not satisfied with your purchase, you can request a full refund within 30 days.",
      },
      {
        question: "Can I access courses on mobile devices?",
        answer:
          "Yes! Our platform is fully responsive and we have dedicated mobile apps for iOS and Android. You can learn anywhere, anytime.",
      },
      {
        question: "How do I apply to become an instructor?",
        answer:
          "You can apply through our instructor portal. We welcome industry professionals, subject matter experts, and experienced educators to share their knowledge with our global learning community.",
      },
    ],
    ar: [
      {
        question: "كيف أختار الدورة المناسبة لمستوى مهارتي؟",
        answer:
          "كل دورة تشير بوضوح إلى مستوى صعوبتها (مبتدئ، متوسط، متقدم). يمكنك أيضًا قراءة التقييمات من الطلاب ذوي الخلفيات المماثلة ومشاهدة معاينات الدورة لتقييم ما إذا كانت تناسب مستوى مهارتك.",
      },
      {
        question: "هل يمكنني التعلم بوتيرتي الخاصة؟",
        answer:
          "بالتأكيد! جميع الدورات ذاتية السرعة مع وصول مدى الحياة. يمكنك إكمالها وفقًا لجدولك الزمني، وإيقافها واستئنافها في أي وقت، وإعادة زيارة المواد متى احتجت.",
      },
      {
        question: "هل أحصل على شهادة بعد إكمال الدورة؟",
        answer:
          "نعم، لجميع الدورات المدفوعة، ستتلقى شهادة إتمام قابلة للتحقق يمكنك مشاركتها على LinkedIn، أو تضمينها في سيرتك الذاتية، أو عرضها لأصحاب العمل.",
      },
      {
        question: "ماذا لو لم أكن راضيًا عن الدورة؟",
        answer:
          "نحن نقدم ضمان استرداد الأموال لمدة 30 يومًا لجميع الدورات. إذا لم تكن راضيًا عن شرائك، يمكنك طلب استرداد كامل خلال 30 يومًا.",
      },
      {
        question: "هل يمكنني الوصول إلى الدورات على الأجهزة المحمولة؟",
        answer:
          "نعم! منصتنا متجاوبة بالكامل ولدينا تطبيقات جوال مخصصة لنظامي iOS و Android. يمكنك التعلم في أي مكان وفي أي وقت.",
      },
      {
        question: "كيف أتقدم بطلب لأصبح مدربًا؟",
        answer:
          "يمكنك التقديم من خلال بوابة المدربين. نرحب بالمحترفين في الصناعة، وخبراء الموضوع، والمعلمين ذوي الخبرة لمشاركة معرفتهم مع مجتمعنا التعليمي العالمي.",
      },
    ],
  };
  return faqs[lang] || faqs.en;
}

// controllers/searchController.js
const Lesson = require("../models/Lesson");

exports.searchContent = async (req, res) => {
  try {
    const {
      q = "",
      type = "all",
      lang = "en",
      page = 1,
      limit = 10,
      category,
      level,
      price_min,
      price_max,
      sort = "relevance",
    } = req.query;

    const searchQuery = q.trim();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    console.log("Search request:", {
      query: searchQuery,
      type,
      page: pageNum,
      limit: limitNum,
      category,
      level,
      price_min,
      price_max,
      sort,
    });

    // Initialize results with empty arrays
    let results = {
      courses: [],
      instructors: [],
      lessons: [],
      total: 0,
      page: pageNum,
      totalPages: 0,
      hasMore: false,
    };

    // If no search query, return empty results
    if (!searchQuery) {
      return res.json({
        success: true,
        data: results,
      });
    }

    // Build search conditions for courses
    const courseConditions = {
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { subtitle: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { whatYoullLearn: { $regex: searchQuery, $options: "i" } },
      ],
      status: "published",
      isPublished: true,
    };

    // Add filters to course conditions
    if (category) {
      courseConditions.category = category;
    }
    if (level) {
      courseConditions.level = level;
    }
    if (price_min || price_max) {
      courseConditions.price = {};
      if (price_min) courseConditions.price.$gte = parseFloat(price_min);
      if (price_max) courseConditions.price.$lte = parseFloat(price_max);
    }

    // Determine sort order for courses
    let courseSortOptions = {};
    switch (sort) {
      case "price-low":
        courseSortOptions = { price: 1 };
        break;
      case "price-high":
        courseSortOptions = { price: -1 };
        break;
      case "rating":
        courseSortOptions = { "ratings.average": -1 };
        break;
      case "students":
        courseSortOptions = { studentsEnrolled: -1 };
        break;
      case "newest":
        courseSortOptions = { createdAt: -1 };
        break;
      default: // relevance
        courseSortOptions = {
          "ratings.average": -1,
          studentsEnrolled: -1,
        };
    }

    // Execute searches based on type - FIXED LOGIC
    if (type === "all" || type === "courses") {
      console.log("Searching courses with conditions:", courseConditions);

      const [courses, totalCourses] = await Promise.all([
        Course.find(courseConditions)
          .populate("instructor", "name avatar expertise")
          .select(
            "title subtitle image price ratings studentsEnrolled level category slug totalHours lecturesCount instructor createdAt"
          )
          .sort(courseSortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Course.countDocuments(courseConditions),
      ]);

      console.log(`Found ${courses.length} courses, total: ${totalCourses}`);

      results.courses = processCourses(courses, lang);

      // For single type search, only count courses
      if (type === "courses") {
        results.total = totalCourses;
      } else {
        results.total += totalCourses;
      }
    }

    // Search instructors - FIXED: Only search when type is all or instructors
    if (type === "all" || type === "instructors") {
      const instructorConditions = {
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { bio: { $regex: searchQuery, $options: "i" } },
          { expertise: { $in: [new RegExp(searchQuery, "i")] } },
        ],
        role: "instructor",
        isActive: true,
      };

      console.log(
        "Searching instructors with conditions:",
        instructorConditions
      );

      const [instructors, totalInstructors] = await Promise.all([
        User.find(instructorConditions)
          .select("name avatar bio expertise instructorStats")
          .sort({ "instructorStats.totalStudents": -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        User.countDocuments(instructorConditions),
      ]);

      console.log(
        `Found ${instructors.length} instructors, total: ${totalInstructors}`
      );

      results.instructors = processInstructors(instructors, lang);

      // For single type search, only count instructors
      if (type === "instructors") {
        results.total = totalInstructors;
      } else if (type === "all") {
        results.total += totalInstructors;
      }
    }

    // Search lessons - FIXED: Only search when type is all or lessons
    if (type === "all" || type === "lessons") {
      const lessonConditions = {
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { description: { $regex: searchQuery, $options: "i" } },
        ],
      };

      console.log("Searching lessons with conditions:", lessonConditions);

      const [lessons, totalLessons] = await Promise.all([
        Lesson.find(lessonConditions)
          .populate({
            path: "course",
            select: "title instructor slug",
            populate: {
              path: "instructor",
              select: "name",
            },
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Lesson.countDocuments(lessonConditions),
      ]);

      console.log(`Found ${lessons.length} lessons, total: ${totalLessons}`);

      results.lessons = processLessons(lessons, lang);

      // For single type search, only count lessons
      if (type === "lessons") {
        results.total = totalLessons;
      } else if (type === "all") {
        results.total += totalLessons;
      }
    }

    // Calculate pagination based on the actual total for the current type
    results.totalPages = Math.ceil(results.total / limitNum);
    results.hasMore = pageNum < results.totalPages;

    console.log("Final results:", {
      courses: results.courses.length,
      instructors: results.instructors.length,
      lessons: results.lessons.length,
      total: results.total,
      totalPages: results.totalPages,
      hasMore: results.hasMore,
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to perform search",
    });
  }
};

// Helper functions
function processCourses(courses, lang) {
  const levelTranslations = {
    en: {
      Beginner: "Beginner",
      Intermediate: "Intermediate",
      Advanced: "Advanced",
    },
    ar: {
      Beginner: "مبتدئ",
      Intermediate: "متوسط",
      Advanced: "متقدم",
    },
  };

  return courses.map((course) => ({
    id: course._id,
    title: course.title,
    subtitle: course.subtitle,
    image: course.image,
    price: course.price,
    ratings: course.ratings,
    studentsEnrolled: course.studentsEnrolled,
    level: levelTranslations[lang]?.[course.level] || course.level,
    category: course.category,
    slug: course.slug,
    totalHours: course.totalHours,
    lecturesCount: course.lecturesCount,
    instructor: course.instructor
      ? {
          id: course.instructor._id,
          name: course.instructor.name,
          avatar: course.instructor.avatar,
          expertise: course.instructor.expertise || [],
        }
      : null,
  }));
}

function processInstructors(instructors, lang) {
  return instructors.map((instructor) => ({
    id: instructor._id,
    name: instructor.name,
    avatar: instructor.avatar,
    bio:
      lang === "ar"
        ? "مدرب محترف مع سنوات من الخبرة"
        : instructor.bio || "Professional instructor with years of experience",
    expertise: instructor.expertise || [],
    stats: instructor.instructorStats || {},
  }));
}

function processLessons(lessons, lang) {
  return lessons.map((lesson) => ({
    id: lesson._id,
    title: lesson.title,
    description: lesson.description,
    duration: lesson.duration,
    isPreview: lesson.isPreview,
    course: lesson.course
      ? {
          id: lesson.course._id,
          title: lesson.course.title,
          instructor: lesson.course.instructor?.name,
        }
      : null,
  }));
}

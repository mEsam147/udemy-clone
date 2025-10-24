// seedDatabase.js
const mongoose = require('mongoose')
const User = require('../models/User')
const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const Enrollment = require('../models/Enrollment')
const Certificate = require('../models/Certificate')
const Notification = require('../models/Notification')
const Review = require('../models/Review')
const { faker } = require('@faker-js/faker')
const slugify = require('slugify')

faker.seed(123) // For reproducible fake data

// High-quality free images from Unsplash (education/tech themed)
const COURSE_IMAGES = [
  'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=800&h=400&fit=crop', // Programming
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop', // Design
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop', // Data Science
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop', // Marketing
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=400&fit=crop', // Business
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop', // Analytics
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop', // Development
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop', // Teamwork
  'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=400&fit=crop', // Mobile
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop', // Coding
]

// Free stock video URLs (educational/demo videos)
const LESSON_VIDEOS = [
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    public_id: 'lesson_video_1',
    format: 'mp4',
    bytes: 104857600,
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    public_id: 'lesson_video_2',
    format: 'mp4',
    bytes: 94371840,
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    public_id: 'lesson_video_3',
    format: 'mp4',
    bytes: 83886080,
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    public_id: 'lesson_video_4',
    format: 'mp4',
    bytes: 73400320,
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    public_id: 'lesson_video_5',
    format: 'mp4',
    bytes: 62914560,
  },
]

// High-quality avatar images from Unsplash
const USER_AVATARS = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face',
]

// Certificate template images
const CERTIFICATE_TEMPLATES = [
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&h=400&fit=crop', // Certificate 1
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop', // Certificate 2
  'https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&h=400&fit=crop', // Certificate 3
]

const COURSE_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Graphic Design',
  'Digital Marketing',
  'Business',
  'Photography',
  'Music',
  'Health & Fitness',
]

const COURSE_SUBCATEGORIES = {
  'Web Development': ['JavaScript', 'React', 'Node.js', 'Python', 'Full Stack'],
  'Mobile Development': ['React Native', 'Flutter', 'iOS', 'Android'],
  'Data Science': ['Python', 'R', 'SQL', 'Data Visualization'],
  'Machine Learning': ['Deep Learning', 'NLP', 'Computer Vision'],
  'Graphic Design': ['UI/UX', 'Photoshop', 'Illustrator'],
  'Digital Marketing': ['SEO', 'Social Media', 'Content Marketing'],
  Business: ['Entrepreneurship', 'Management', 'Finance'],
  Photography: ['Portrait', 'Landscape', 'Editing'],
  Music: ['Production', 'Guitar', 'Piano'],
  'Health & Fitness': ['Yoga', 'Nutrition', 'Workout'],
}

// Helper function to generate unique slugs
const generateUniqueSlug = async (title, existingSlugs = []) => {
  let baseSlug = slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  })

  let slug = baseSlug
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  while (await Course.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

const seedDatabase = async (req, res) => {
  try {
    console.log('Starting seeding process with high-quality dummy data...')

    // Clear existing data
    await User.deleteMany({})
    await Course.deleteMany({})
    await Lesson.deleteMany({})
    await Enrollment.deleteMany({})
    await Certificate.deleteMany({})
    await Notification.deleteMany({})
    await Review.deleteMany({})
    console.log('Existing data cleared')

    // Generate 20 Students
    const students = []
    for (let i = 1; i <= 20; i++) {
      const student = {
        name: faker.person.fullName(),
        email: `student${i}@example.com`,
        password: '$2a$12$LQv3c1yqBzwS0eDjV2C4OuBr7JZM2BsjJYIVFQ3QzRZ5rW5W5W5W', // password123
        role: 'student',
        avatar: faker.helpers.arrayElement(USER_AVATARS),
        bio: faker.person.bio(),
        isVerified: true,
        notificationSettings: {
          email: true,
          push: false,
          marketing: true,
          courseUpdates: true,
          newMessages: true,
        },
      }
      students.push(student)
    }

    // Generate 5 Instructors with realistic bios
    const instructors = []
    const instructorData = [
      {
        name: 'Sarah Johnson',
        expertise: ['JavaScript', 'React', 'Node.js'],
        bio: 'Senior Full Stack Developer with 8+ years of experience. Passionate about teaching modern web technologies.',
      },
      {
        name: 'Dr. Michael Chen',
        expertise: ['Python', 'Data Science', 'Machine Learning'],
        bio: 'Data Scientist and AI researcher. PhD in Computer Science from Stanford University.',
      },
      {
        name: 'Emily Rodriguez',
        expertise: ['UI/UX Design', 'Figma', 'Adobe Creative Suite'],
        bio: 'Award-winning UI/UX designer with 6 years of experience in product design and user research.',
      },
      {
        name: 'David Kim',
        expertise: ['Digital Marketing', 'SEO', 'Content Strategy'],
        bio: 'Digital marketing expert who has helped businesses grow their online presence by 300%.',
      },
      {
        name: 'Alex Thompson',
        expertise: ['Mobile Development', 'Flutter', 'Firebase'],
        bio: 'Mobile app developer specializing in cross-platform development with Flutter and React Native.',
      },
    ]

    for (let i = 0; i < 5; i++) {
      const instructor = {
        name: instructorData[i].name,
        email: `instructor${i + 1}@example.com`,
        password: '$2a$12$LQv3c1yqBzwS0eDjV2C4OuBr7JZM2BsjJYIVFQ3QzRZ5rW5W5W5W',
        role: 'instructor',
        avatar: USER_AVATARS[i],
        bio: instructorData[i].bio,
        expertise: instructorData[i].expertise,
        instructorApplication: {
          status: 'approved',
          submittedAt: faker.date.past(),
        },
        instructorProfile: {
          availability: 'within-24-hours',
          responseTime: 'Typically responds within 24 hours',
          officeHours: 'Mon-Fri, 9AM-5PM EST',
          contactEmail: `instructor${i + 1}@example.com`,
        },
        instructorStats: {
          totalStudents: faker.number.int({ min: 500, max: 2000 }),
          totalRevenue: faker.number.int({ min: 50000, max: 200000 }),
          averageRating: parseFloat((Math.random() * 0.5 + 4.5).toFixed(1)), // 4.5 - 5.0
          totalCourses: 6,
        },
      }
      instructors.push(instructor)
    }

    // Generate 2 Admins
    const admins = []
    for (let i = 1; i <= 2; i++) {
      const admin = {
        name: `Admin ${faker.person.lastName()}`,
        email: `admin${i}@example.com`,
        password: '$2a$12$LQv3c1yqBzwS0eDjV2C4OuBr7JZM2BsjJYIVFQ3QzRZ5rW5W5W5W',
        role: 'admin',
        avatar: USER_AVATARS[i + 5],
        bio: 'Platform administrator with extensive experience in education technology.',
        isVerified: true,
      }
      admins.push(admin)
    }

    // Create all users
    const allUsersData = [...students, ...instructors, ...admins]
    const createdUsers = await User.insertMany(allUsersData)
    console.log(`Created ${createdUsers.length} users`)

    const createdStudents = createdUsers.slice(0, 20)
    const createdInstructors = createdUsers.slice(20, 25)
    const createdAdmins = createdUsers.slice(25)

    // Generate 30 Courses with realistic data
    const courses = []
    const courseData = [
      {
        title: 'Complete Web Development Bootcamp 2024',
        category: 'Web Development',
        subcategory: 'Full Stack',
        level: 'Beginner',
        description:
          'Learn web development from scratch. HTML, CSS, JavaScript, React, Node.js, MongoDB and more! Build real projects and become a full-stack developer.',
        price: 89,
      },
      {
        title: 'Advanced JavaScript Patterns and Practices',
        category: 'Web Development',
        subcategory: 'JavaScript',
        level: 'Advanced',
        description:
          'Master advanced JavaScript concepts, design patterns, and best practices used by senior developers.',
        price: 129,
      },
      {
        title: 'React Native Mobile App Development',
        category: 'Mobile Development',
        subcategory: 'React Native',
        level: 'Intermediate',
        description:
          'Build cross-platform mobile apps with React Native. Learn to create iOS and Android apps from a single codebase.',
        price: 99,
      },
      {
        title: 'Python for Data Science and Machine Learning',
        category: 'Data Science',
        subcategory: 'Python',
        level: 'Intermediate',
        description:
          'Complete Data Science and Machine Learning course with Python. Pandas, NumPy, Scikit-learn, TensorFlow.',
        price: 149,
      },
      {
        title: 'UI/UX Design Fundamentals',
        category: 'Graphic Design',
        subcategory: 'UI/UX',
        level: 'Beginner',
        description:
          'Learn the principles of user interface and user experience design. Create beautiful and functional designs.',
        price: 79,
      },
      {
        title: 'Digital Marketing Mastery',
        category: 'Digital Marketing',
        subcategory: 'Content Marketing',
        level: 'All Levels',
        description:
          'Comprehensive digital marketing course covering SEO, social media, content marketing, and analytics.',
        price: 119,
      },
      {
        title: 'Full Stack Development with MERN',
        category: 'Web Development',
        subcategory: 'Full Stack',
        level: 'Intermediate',
        description:
          'Master the MERN stack (MongoDB, Express, React, Node.js) and build modern web applications.',
        price: 109,
      },
      {
        title: 'Node.js Backend Development',
        category: 'Web Development',
        subcategory: 'Node.js',
        level: 'Intermediate',
        description:
          'Learn to build scalable backend applications with Node.js, Express, and modern development tools.',
        price: 99,
      },
      {
        title: 'GraphQL API Design and Implementation',
        category: 'Web Development',
        subcategory: 'JavaScript',
        level: 'Advanced',
        description:
          'Master GraphQL API design, implementation, and best practices for modern web applications.',
        price: 139,
      },
      {
        title: 'AWS Cloud Practitioner Essentials',
        category: 'Web Development',
        subcategory: 'Python',
        level: 'Beginner',
        description:
          'Learn AWS cloud computing fundamentals and prepare for the AWS Cloud Practitioner certification.',
        price: 159,
      },
    ]

    // Expand course data to 30 courses
    const expandedCourseData = []
    for (let i = 0; i < 30; i++) {
      const baseCourse = courseData[i % courseData.length]
      expandedCourseData.push({
        ...baseCourse,
        title: i < courseData.length ? baseCourse.title : `${baseCourse.title} - Advanced Edition`,
        price: baseCourse.price + (i % 3) * 20,
      })
    }

    let courseIndex = 0
    for (let instrIdx = 0; instrIdx < createdInstructors.length; instrIdx++) {
      for (let courseIdx = 1; courseIdx <= 6; courseIdx++) {
        const courseInfo = expandedCourseData[courseIndex]

        const course = {
          title: courseInfo.title,
          subtitle: faker.lorem.sentence({ min: 8, max: 12 }),
          description: courseInfo.description,
          instructor: createdInstructors[instrIdx]._id,
          price: courseInfo.price,
          image: COURSE_IMAGES[courseIndex % COURSE_IMAGES.length],
          category: courseInfo.category,
          subcategory: courseInfo.subcategory,
          level: courseInfo.level,
          language: 'en',
          ratings: {
            average: parseFloat((Math.random() * 0.5 + 4.3).toFixed(1)), // 4.3 - 4.8
            count: faker.number.int({ min: 50, max: 300 }),
          },
          studentsEnrolled: faker.number.int({ min: 200, max: 1500 }),
          requirements: [
            'Basic computer knowledge',
            'Willingness to learn and practice',
            'Internet connection',
            'Modern web browser',
          ],
          whatYoullLearn: [
            'Master fundamental concepts and techniques',
            'Build real-world projects and applications',
            'Develop professional-level skills',
            'Prepare for industry certifications',
            'Learn best practices and standards',
            'Gain hands-on experience with modern tools',
            'Understand industry trends and requirements',
            'Build a professional portfolio',
          ],
          totalHours: faker.number.int({ min: 15, max: 45 }),
          lecturesCount: faker.number.int({ min: 20, max: 35 }),
          status: 'published',
          isPublished: true,
          isFeatured: courseIndex < 8, // First 8 courses are featured
          features: [
            'Lifetime access',
            'Certificate of completion',
            'Q&A support',
            'Downloadable resources',
            'Mobile and TV access',
            'Exercises and projects',
            'Community access',
          ],
          publishedAt: faker.date.past({ years: 1 }),
        }
        courses.push(course)
        courseIndex++
      }
    }

    // Create courses one by one to ensure slugs are generated
    console.log('Creating courses with unique slugs...')
    const createdCourses = []
    const usedSlugs = new Set()

    for (const courseData of courses) {
      try {
        const slug = await generateUniqueSlug(courseData.title, Array.from(usedSlugs))
        usedSlugs.add(slug)

        const courseWithSlug = {
          ...courseData,
          slug: slug,
        }

        const newCourse = new Course(courseWithSlug)
        await newCourse.save()
        createdCourses.push(newCourse)

        console.log(`Created course: ${courseData.title}`)
      } catch (error) {
        console.error(`Failed to create course "${courseData.title}":`, error.message)
      }
    }

    console.log(`Successfully created ${createdCourses.length} courses`)

    if (createdCourses.length === 0) {
      throw new Error('No courses were created. Cannot proceed with seeding.')
    }

    // Generate Lessons with realistic content
    const lessons = []
    const lessonTemplates = [
      {
        title: 'Introduction to the Course',
        description:
          "Get an overview of what you'll learn and set up your development environment.",
      },
      {
        title: 'Setting Up Development Environment',
        description: 'Install and configure all necessary tools and software for the course.',
      },
      {
        title: 'Understanding Basic Concepts',
        description: 'Learn the fundamental concepts that form the foundation of this technology.',
      },
      {
        title: 'Hands-on Practice Session',
        description: "Apply what you've learned through practical exercises and coding challenges.",
      },
      {
        title: 'Advanced Techniques and Methods',
        description: 'Dive deeper into advanced concepts and professional development techniques.',
      },
      {
        title: 'Project Setup and Configuration',
        description: 'Learn how to properly set up and configure real-world projects.',
      },
      {
        title: 'Core Principles Explained',
        description: 'Understand the core principles and best practices used by professionals.',
      },
      {
        title: 'Practical Implementation Guide',
        description: 'Step-by-step guide to implementing concepts in real projects.',
      },
      {
        title: 'Troubleshooting Common Issues',
        description: 'Learn how to identify and fix common problems and errors.',
      },
      {
        title: 'Best Practices and Standards',
        description: 'Discover industry best practices and coding standards.',
      },
      {
        title: 'Real-world Case Studies',
        description: 'Analyze real-world examples and case studies from successful projects.',
      },
      {
        title: 'Performance Optimization',
        description: 'Learn techniques to optimize performance and efficiency.',
      },
      {
        title: 'Security Considerations',
        description: 'Understand security best practices and common vulnerabilities.',
      },
      {
        title: 'Testing and Deployment',
        description: 'Learn how to properly test and deploy your applications.',
      },
      {
        title: 'Future Trends and Updates',
        description: 'Explore emerging trends and future developments in the field.',
      },
    ]

    for (const course of createdCourses) {
      const numLessons = faker.number.int({ min: 12, max: 20 })
      for (let lessonIdx = 1; lessonIdx <= numLessons; lessonIdx++) {
        const video = faker.helpers.arrayElement(LESSON_VIDEOS)
        const lessonTemplate = lessonTemplates[lessonIdx % lessonTemplates.length]

        const resources = [
          {
            title: 'Lesson Slides and Notes',
            url: 'https://example.com/resources/slides.pdf',
            type: 'pdf',
            fileSize: 1024000,
            uploadedAt: faker.date.past(),
          },
          {
            title: 'Source Code Files',
            url: 'https://example.com/resources/code.zip',
            type: 'zip',
            fileSize: 2048000,
            uploadedAt: faker.date.past(),
          },
        ]

        const lesson = {
          title: `${lessonTemplate.title} - Part ${lessonIdx}`,
          description: lessonTemplate.description,
          video: {
            public_id: video.public_id,
            url: video.url,
            format: video.format,
            bytes: video.bytes,
          },
          duration: faker.number.int({ min: 900, max: 7200 }), // 15-120 minutes
          course: course._id,
          order: lessonIdx,
          isPreview: lessonIdx <= 3, // First 3 lessons are preview
          resources: resources,
        }
        lessons.push(lesson)
      }
    }

    // Create lessons one by one to handle validation errors gracefully
    console.log('Creating lessons...')
    const createdLessons = []
    let lessonSuccessCount = 0
    let lessonErrorCount = 0

    for (const lessonData of lessons) {
      try {
        const newLesson = new Lesson(lessonData)
        await newLesson.save()
        createdLessons.push(newLesson)
        lessonSuccessCount++
      } catch (error) {
        console.error(`Failed to create lesson "${lessonData.title}":`, error.message)
        lessonErrorCount++
      }
    }

    console.log(`Successfully created ${lessonSuccessCount} lessons, ${lessonErrorCount} failed`)

    // Generate Enrollments
    const enrollments = []
    for (const student of createdStudents) {
      const numEnrollments = faker.number.int({ min: 4, max: 10 })
      const availableCourses = faker.helpers.shuffle([...createdCourses]).slice(0, numEnrollments)

      for (const course of availableCourses) {
        const courseLessons = createdLessons.filter(
          (l) => l.course.toString() === course._id.toString()
        )

        const numCompleted = faker.number.int({
          min: 0,
          max: courseLessons.length,
        })

        const completedLessons = courseLessons.slice(0, numCompleted).map((l) => l._id)

        const progress =
          courseLessons.length > 0 ? Math.round((numCompleted / courseLessons.length) * 100) : 0

        const enrollment = {
          student: student._id,
          course: course._id,
          completedLessons,
          progress,
          enrolledAt: faker.date.past({ years: 1 }),
          lastAccessed: faker.date.recent(),
          rating:
            Math.random() > 0.4
              ? {
                  score: faker.number.int({ min: 4, max: 5 }),
                  review: faker.lorem.paragraph(),
                  ratedAt: faker.date.past(),
                }
              : undefined,
        }
        enrollments.push(enrollment)
      }
    }

    const createdEnrollments = await Enrollment.insertMany(enrollments)
    console.log(`Created ${createdEnrollments.length} enrollments`)

    // Generate Certificates
    console.log('Creating certificates...')
    const createdCertificates = []
    const completedEnrollments = createdEnrollments.filter((e) => e.progress === 100)

    // Track used verification codes to ensure uniqueness
    const usedVerificationCodes = new Set()

    for (const enrollment of completedEnrollments.slice(0, 25)) {
      try {
        const course = createdCourses.find((c) => c._id.toString() === enrollment.course.toString())

        if (!course) {
          console.warn(`Course not found for enrollment ${enrollment._id}`)
          continue
        }

        // Generate unique verification code
        let verificationCode
        let attempts = 0
        do {
          verificationCode = `CERT-${course.slug.toUpperCase()}-${faker.string
            .alphanumeric(8)
            .toUpperCase()}`
          attempts++
          if (attempts > 10) {
            verificationCode = `CERT-${Date.now()}-${faker.string.alphanumeric(8).toUpperCase()}`
            break
          }
        } while (usedVerificationCodes.has(verificationCode))

        usedVerificationCodes.add(verificationCode)

        const certificate = {
          student: enrollment.student,
          course: enrollment.course,
          issueDate: faker.date.past(),
          certificateUrl: faker.helpers.arrayElement(CERTIFICATE_TEMPLATES),
          verificationCode: verificationCode,
          approved: true,
        }

        const newCertificate = new Certificate(certificate)
        await newCertificate.save()
        createdCertificates.push(newCertificate)
      } catch (error) {
        console.error(
          `Failed to create certificate for enrollment ${enrollment._id}:`,
          error.message
        )
      }
    }

    console.log(`Successfully created ${createdCertificates.length} certificates`)

    // Generate Notifications
    const notifications = []
    const notificationTypes = [
      'ENROLLMENT',
      'LESSON_COMPLETED',
      'COURSE_UPDATED',
      'REVIEW_ADDED',
      'PAYMENT_SUCCESS',
      'COURSE_COMPLETED',
    ]

    for (const user of createdUsers) {
      const numNotifications = faker.number.int({ min: 5, max: 12 })

      for (let i = 0; i < numNotifications; i++) {
        const type = faker.helpers.arrayElement(notificationTypes)
        const course = faker.helpers.arrayElement(createdCourses)
        let message = ''

        switch (type) {
          case 'ENROLLMENT':
            message = `You have been successfully enrolled in "${course.title}"`
            break
          case 'LESSON_COMPLETED':
            message = `Great job! You completed a lesson in "${course.title}"`
            break
          case 'COURSE_UPDATED':
            message = `New content has been added to "${course.title}"`
            break
          case 'REVIEW_ADDED':
            message = 'Your course review has been published and is now visible to other students'
            break
          case 'PAYMENT_SUCCESS':
            message = 'Your payment was processed successfully. Thank you for your purchase!'
            break
          case 'COURSE_COMPLETED':
            message = `Congratulations! You've successfully completed "${course.title}"`
            break
        }

        const notification = {
          user: user._id,
          type: type,
          message: message,
          course: course._id,
          read: faker.datatype.boolean(),
          createdAt: faker.date.past({ months: 6 }),
        }
        notifications.push(notification)
      }
    }

    const createdNotifications = await Notification.insertMany(notifications)
    console.log(`Created ${createdNotifications.length} notifications`)

    // Generate Reviews
    const reviews = []
    for (const enrollment of createdEnrollments.slice(0, 60)) {
      const review = {
        user: enrollment.student,
        course: enrollment.course,
        rating: faker.number.int({ min: 4, max: 5 }),
        comment: faker.lorem.paragraphs(1),
        helpful: {
          count: faker.number.int({ min: 0, max: 15 }),
          users: faker.helpers
            .arrayElements(createdStudents, faker.number.int({ min: 0, max: 8 }))
            .map((u) => u._id),
        },
        createdAt: faker.date.past(),
      }
      reviews.push(review)
    }

    const createdReviews = await Review.insertMany(reviews)
    console.log(`Created ${createdReviews.length} reviews`)

    // Update course ratings based on reviews
    for (const course of createdCourses) {
      const courseReviews = createdReviews.filter(
        (r) => r.course.toString() === course._id.toString()
      )

      if (courseReviews.length > 0) {
        const averageRating =
          courseReviews.reduce((sum, review) => sum + review.rating, 0) / courseReviews.length

        await Course.findByIdAndUpdate(course._id, {
          'ratings.average': parseFloat(averageRating.toFixed(1)),
          'ratings.count': courseReviews.length,
        })
      }
    }

    // Add wishlist items for students
    for (const student of createdStudents) {
      const numWishlist = faker.number.int({ min: 2, max: 6 })
      const wishlistItems = faker.helpers
        .arrayElements(createdCourses, numWishlist)
        .map((c) => c._id)

      await User.findByIdAndUpdate(student._id, {
        wishlist: wishlistItems,
      })
    }

    // Summary
    const summary = {
      totalUsers: createdUsers.length,
      totalStudents: createdStudents.length,
      totalInstructors: createdInstructors.length,
      totalAdmins: createdAdmins.length,
      totalCourses: createdCourses.length,
      totalLessons: createdLessons.length,
      totalEnrollments: createdEnrollments.length,
      totalCertificates: createdCertificates.length,
      totalNotifications: createdNotifications.length,
      totalReviews: createdReviews.length,
      sampleCredentials: {
        students: [
          { email: 'student1@example.com', password: 'password123', role: 'student' },
          { email: 'student2@example.com', password: 'password123', role: 'student' },
        ],
        instructors: [
          { email: 'instructor1@example.com', password: 'password123', role: 'instructor' },
          { email: 'instructor2@example.com', password: 'password123', role: 'instructor' },
        ],
        admins: [
          { email: 'admin1@example.com', password: 'password123', role: 'admin' },
          { email: 'admin2@example.com', password: 'password123', role: 'admin' },
        ],
      },
    }

    console.log('🎉 Seeding completed successfully!')
    console.log('📊 Summary:', summary)

    if (res) {
      res.status(200).json({
        success: true,
        message: 'Database seeded with high-quality dummy data successfully',
        summary,
      })
    }

    return summary
  } catch (error) {
    console.error('❌ Seeding error:', error)

    if (res) {
      res.status(500).json({
        success: false,
        message: 'Error seeding database',
        error: error.message,
      })
    }

    throw error
  }
}

// For direct script execution
if (require.main === module) {
  require('dotenv').config()

  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/udemyClone')
    .then(() => {
      console.log('Connected to MongoDB')
      seedDatabase()
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err)
      process.exit(1)
    })
}

module.exports = seedDatabase

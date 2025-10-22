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

// Real Cloudinary URLs for images and videos
const REAL_IMAGES = [
  'https://res.cloudinary.com/demo/image/upload/v1704821234/course1.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1704821235/course2.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1704821236/course3.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1704821237/course4.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1704821238/course5.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1704821239/course6.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1704821240/course7.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1704821241/course8.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1704821242/course9.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1704821243/course10.jpg',
]

const REAL_VIDEOS = [
  {
    url: 'https://res.cloudinary.com/demo/video/upload/v1704821300/lesson1.mp4',
    public_id: 'lesson_video_1',
    format: 'mp4',
    bytes: 15728640,
  },
  {
    url: 'https://res.cloudinary.com/demo/video/upload/v1704821301/lesson2.mp4',
    public_id: 'lesson_video_2',
    format: 'mp4',
    bytes: 20971520,
  },
  {
    url: 'https://res.cloudinary.com/demo/video/upload/v1704821302/lesson3.mp4',
    public_id: 'lesson_video_3',
    format: 'mp4',
    bytes: 12582912,
  },
  {
    url: 'https://res.cloudinary.com/demo/video/upload/v1704821303/lesson4.mp4',
    public_id: 'lesson_video_4',
    format: 'mp4',
    bytes: 18874368,
  },
  {
    url: 'https://res.cloudinary.com/demo/video/upload/v1704821304/lesson5.mp4',
    public_id: 'lesson_video_5',
    format: 'mp4',
    bytes: 16777216,
  },
]

const REAL_AVATARS = [
  'https://res.cloudinary.com/demo/image/upload/v1704821400/avatar1.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1704821401/avatar2.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1704821402/avatar3.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1704821403/avatar4.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1704821404/avatar5.jpg',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
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
    console.log('Starting seeding process with real Cloudinary assets...')

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
        avatar: faker.helpers.arrayElement(REAL_AVATARS),
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

    // Generate 5 Instructors
    const instructors = []
    const instructorExpertise = [
      ['JavaScript', 'React', 'Node.js'],
      ['Python', 'Data Science', 'Machine Learning'],
      ['UI/UX Design', 'Figma', 'Adobe Creative Suite'],
      ['Digital Marketing', 'SEO', 'Content Strategy'],
      ['Mobile Development', 'Flutter', 'Firebase'],
    ]

    for (let i = 1; i <= 5; i++) {
      const instructor = {
        name: faker.person.fullName(),
        email: `instructor${i}@example.com`,
        password: '$2a$12$LQv3c1yqBzwS0eDjV2C4OuBr7JZM2BsjJYIVFQ3QzRZ5rW5W5W5W', // password123
        role: 'instructor',
        avatar: faker.helpers.arrayElement(REAL_AVATARS),
        bio: faker.lorem.paragraphs(2),
        expertise: instructorExpertise[i - 1],
        instructorApplication: {
          status: 'approved',
          submittedAt: faker.date.past(),
        },
        instructorProfile: {
          availability: 'within-24-hours',
          responseTime: 'Typically responds within 24 hours',
          officeHours: 'Mon-Fri, 9AM-5PM EST',
          contactEmail: `instructor${i}@example.com`,
        },
        instructorStats: {
          totalStudents: faker.number.int({ min: 50, max: 500 }),
          totalRevenue: faker.number.int({ min: 1000, max: 50000 }),
          averageRating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
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
        password: '$2a$12$LQv3c1yqBzwS0eDjV2C4OuBr7JZM2BsjJYIVFQ3QzRZ5rW5W5W5W', // password123
        role: 'admin',
        avatar: faker.helpers.arrayElement(REAL_AVATARS),
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

    // Generate 30 Courses (6 per instructor)
    const courses = []
    const courseTitles = [
      'Complete Web Development Bootcamp 2024',
      'Advanced JavaScript Patterns and Practices',
      'React Native Mobile App Development',
      'Python for Data Science and Machine Learning',
      'UI/UX Design Fundamentals',
      'Digital Marketing Mastery',
      'Full Stack Development with MERN',
      'Node.js Backend Development',
      'GraphQL API Design and Implementation',
      'AWS Cloud Practitioner Essentials',
      'iOS App Development with SwiftUI',
      'Android Development with Kotlin',
      'Machine Learning with TensorFlow',
      'Deep Learning Specialization',
      'Cybersecurity Fundamentals',
      'Blockchain and Web3 Development',
      'DevOps and CI/CD Pipeline',
      'Docker and Kubernetes Mastery',
      'Software Architecture Patterns',
      'Agile Project Management',
      'Content Marketing Strategy',
      'Social Media Marketing Pro',
      'Photography Masterclass',
      'Video Editing with Premiere Pro',
      'Music Production Fundamentals',
      'Personal Finance and Investing',
      'Business Startup Essentials',
      'Public Speaking and Presentation',
      'Yoga and Mindfulness Practice',
      'Nutrition and Healthy Cooking',
    ]

    let courseIndex = 0
    for (let instrIdx = 0; instrIdx < createdInstructors.length; instrIdx++) {
      for (let courseIdx = 1; courseIdx <= 6; courseIdx++) {
        const category = faker.helpers.arrayElement(COURSE_CATEGORIES)
        const subcategory = faker.helpers.arrayElement(COURSE_SUBCATEGORIES[category])

        const course = {
          title: courseTitles[courseIndex],
          subtitle: faker.lorem.sentence({ min: 8, max: 12 }),
          description: faker.lorem.paragraphs(4, '\n\n'),
          instructor: createdInstructors[instrIdx]._id,
          price: parseFloat(faker.commerce.price({ min: 19, max: 199, dec: 0 })),
          image: REAL_IMAGES[courseIndex % REAL_IMAGES.length],
          category: category,
          subcategory: subcategory,
          level: faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Advanced', 'All Levels']),
          language: 'en',
          ratings: {
            average: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 - 5.0
            count: faker.number.int({ min: 10, max: 200 }),
          },
          studentsEnrolled: faker.number.int({ min: 50, max: 1000 }),
          requirements: [
            'Basic computer knowledge',
            'Willingness to learn',
            faker.lorem.sentence(),
            faker.lorem.sentence(),
          ],
          whatYoullLearn: [
            'Master fundamental concepts and techniques',
            'Build real-world projects and applications',
            'Develop professional-level skills',
            'Prepare for industry certifications',
            'Learn best practices and standards',
            'Gain hands-on experience with tools',
            faker.lorem.sentence(),
            faker.lorem.sentence(),
          ],
          totalHours: faker.number.int({ min: 10, max: 40 }),
          lecturesCount: faker.number.int({ min: 15, max: 30 }),
          status: 'published',
          isPublished: true,
          isFeatured: courseIndex < 5, // First 5 courses are featured
          features: [
            'Lifetime access',
            'Certificate of completion',
            'Q&A support',
            'Downloadable resources',
            'Mobile and TV access',
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

        console.log(`Created course: ${courseData.title} (slug: ${slug})`)
      } catch (error) {
        console.error(`Failed to create course "${courseData.title}":`, error.message)
      }
    }

    console.log(`Successfully created ${createdCourses.length} courses`)

    if (createdCourses.length === 0) {
      throw new Error('No courses were created. Cannot proceed with seeding.')
    }

    // Generate Lessons with FIXED resources structure
    const lessons = []
    const lessonTitles = [
      'Introduction to the Course',
      'Setting Up Development Environment',
      'Understanding Basic Concepts',
      'Hands-on Practice Session',
      'Advanced Techniques and Methods',
      'Project Setup and Configuration',
      'Core Principles Explained',
      'Practical Implementation Guide',
      'Troubleshooting Common Issues',
      'Best Practices and Standards',
      'Real-world Case Studies',
      'Performance Optimization',
      'Security Considerations',
      'Testing and Deployment',
      'Future Trends and Updates',
    ]

    for (const course of createdCourses) {
      const numLessons = faker.number.int({ min: 8, max: 15 })
      for (let lessonIdx = 1; lessonIdx <= numLessons; lessonIdx++) {
        const video = faker.helpers.arrayElement(REAL_VIDEOS)

        // Fixed resources structure - proper object format
        const resources = [
          {
            title: 'Lesson Slides and Notes',
            url: 'https://res.cloudinary.com/demo/image/upload/v1704821500/slides.pdf',
            type: 'pdf',
            fileSize: 1024000, // 1MB in bytes
            uploadedAt: faker.date.past(),
          },
          {
            title: 'Source Code Files',
            url: 'https://res.cloudinary.com/demo/image/upload/v1704821501/code.zip',
            type: 'zip',
            fileSize: 2048000, // 2MB in bytes
            uploadedAt: faker.date.past(),
          },
        ]

        const lesson = {
          title: `${lessonTitles[lessonIdx % lessonTitles.length]} - Part ${lessonIdx}`,
          description: faker.lorem.paragraphs(2, '\n\n'),
          video: {
            public_id: video.public_id,
            url: video.url,
            format: video.format,
            bytes: video.bytes,
          },
          duration: faker.number.int({ min: 600, max: 3600 }),
          course: course._id,
          order: lessonIdx,
          isPreview: lessonIdx <= 2,
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
      const numEnrollments = faker.number.int({ min: 3, max: 8 })
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
            Math.random() > 0.3
              ? {
                  score: faker.number.int({ min: 3, max: 5 }),
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

    // Generate Certificates - FIXED VERSION (without enrollment field)
    console.log('Creating certificates...')
    const createdCertificates = []
    const completedEnrollments = createdEnrollments.filter((e) => e.progress === 100)

    // Track used verification codes to ensure uniqueness
    const usedVerificationCodes = new Set()

    for (const enrollment of completedEnrollments.slice(0, 15)) {
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
          verificationCode = `CERT-${course._id.toString().slice(-8).toUpperCase()}-${faker.string
            .alphanumeric(6)
            .toUpperCase()}`
          attempts++
          if (attempts > 10) {
            verificationCode = `CERT-${Date.now()}-${faker.string.alphanumeric(6).toUpperCase()}`
            break
          }
        } while (usedVerificationCodes.has(verificationCode))

        usedVerificationCodes.add(verificationCode)

        const certificate = {
          student: enrollment.student,
          course: enrollment.course,
          // Remove enrollment field since it's causing issues
          issueDate: faker.date.past(),
          certificateUrl:
            'https://res.cloudinary.com/demo/image/upload/v1704821600/certificate.pdf',
          verificationCode: verificationCode,
          approved: true,
        }

        const newCertificate = new Certificate(certificate)
        await newCertificate.save()
        createdCertificates.push(newCertificate)
        console.log(
          `Created certificate for student ${enrollment.student} in course ${course.title}`
        )
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
    ]

    for (const user of createdUsers) {
      const numNotifications = faker.number.int({ min: 3, max: 8 })

      for (let i = 0; i < numNotifications; i++) {
        const type = faker.helpers.arrayElement(notificationTypes)
        let message = ''

        switch (type) {
          case 'ENROLLMENT':
            message = `You have been enrolled in ${
              faker.helpers.arrayElement(createdCourses).title
            }`
            break
          case 'LESSON_COMPLETED':
            message = `You completed a lesson in ${
              faker.helpers.arrayElement(createdCourses).title
            }`
            break
          case 'COURSE_UPDATED':
            message = `New content added to ${faker.helpers.arrayElement(createdCourses).title}`
            break
          case 'REVIEW_ADDED':
            message = 'Your review has been published'
            break
          case 'PAYMENT_SUCCESS':
            message = 'Your payment was processed successfully'
            break
        }

        const notification = {
          user: user._id,
          type: type,
          message: message,
          course: Math.random() > 0.3 ? faker.helpers.arrayElement(createdCourses)._id : null,
          read: faker.datatype.boolean(),
          createdAt: faker.date.past({ months: 3 }),
        }
        notifications.push(notification)
      }
    }

    const createdNotifications = await Notification.insertMany(notifications)
    console.log(`Created ${createdNotifications.length} notifications`)

    // Generate Reviews
    const reviews = []
    for (const enrollment of createdEnrollments.slice(0, 40)) {
      const review = {
        user: enrollment.student,
        course: enrollment.course,
        rating: faker.number.int({ min: 3, max: 5 }),
        comment: faker.lorem.paragraphs(1),
        helpful: {
          count: faker.number.int({ min: 0, max: 10 }),
          users: faker.helpers
            .arrayElements(createdStudents, faker.number.int({ min: 0, max: 5 }))
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
      const numWishlist = faker.number.int({ min: 1, max: 4 })
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

    console.log('Seeding completed successfully!')

    if (res) {
      res.status(200).json({
        success: true,
        message: 'Database seeded with real Cloudinary assets successfully',
        summary,
      })
    }

    return summary
  } catch (error) {
    console.error('Seeding error:', error)

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

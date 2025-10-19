const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const User = require('../models/User')
const Enrollment = require('../models/Enrollment')

/**
 * Unified search functionality based on user role
 */
exports.dashboardSearch = async (req, res) => {
  try {
    const { query } = req.query
    const userId = req.user.id
    const userRole = req.user.role

    console.log(`Search request - User: ${userId}, Role: ${userRole}, Query: "${query}"`)

    if (!query || query.trim().length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          results: [],
          total: 0,
          query: '',
        },
      })
    }

    const searchQuery = query.trim()
    const results = []

    // Common search configurations
    const searchOptions = {
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
      ],
    }

    // Student Search Logic
    if (userRole === 'student') {
      console.log('Performing student search...')

      // Search published courses
      const courses = await Course.find({
        ...searchOptions,
        status: 'published',
        isPublished: true,
      })
        .select('title slug category isPublished instructor')
        .populate('instructor', 'name')
        .lean()

      console.log(`Found ${courses.length} courses for student`)

      // Add enrollment status for each course
      const coursesWithEnrollment = await Promise.all(
        courses.map(async (course) => {
          const enrollment = await Enrollment.findOne({
            student: userId,
            course: course._id,
          })
          return {
            _id: course._id,
            title: course.title,
            slug: course.slug,
            category: course.category,
            isPublished: course.isPublished,
            type: 'course',
            isEnrolled: !!enrollment,
          }
        })
      )

      results.push(...coursesWithEnrollment)

      // Search lessons from enrolled or published courses
      const enrolledCourses = await Enrollment.find({
        student: userId,
      }).select('course')

      const enrolledCourseIds = enrolledCourses.map((enrollment) => enrollment.course)

      const lessons = await Lesson.find({
        ...searchOptions,
        course: { $in: enrolledCourseIds },
      })
        .select('title duration course order')
        .populate('course', 'title slug')
        .lean()

      console.log(`Found ${lessons.length} lessons for student`)

      const lessonResults = lessons.map((lesson) => ({
        _id: lesson._id,
        title: lesson.title,
        duration: lesson.duration,
        course: lesson.course,
        type: 'lesson',
      }))

      results.push(...lessonResults)
    }

    // Instructor Search Logic
    else if (userRole === 'instructor') {
      console.log('Performing instructor search...')

      // Search instructor's own courses
      const instructorCourses = await Course.find({
        ...searchOptions,
        instructor: userId,
      })
        .select('title slug category status isPublished')
        .lean()

      console.log(`Found ${instructorCourses.length} instructor courses`)

      const instructorCourseResults = instructorCourses.map((course) => ({
        _id: course._id,
        title: course.title,
        slug: course.slug,
        category: course.category,
        isPublished: course.isPublished,
        type: 'course',
      }))

      results.push(...instructorCourseResults)

      // Search lessons from instructor's courses
      const instructorCourseIds = instructorCourses.map((course) => course._id)

      const instructorLessons = await Lesson.find({
        ...searchOptions,
        course: { $in: instructorCourseIds },
      })
        .select('title duration course order')
        .populate('course', 'title slug')
        .lean()

      console.log(`Found ${instructorLessons.length} instructor lessons`)

      const instructorLessonResults = instructorLessons.map((lesson) => ({
        _id: lesson._id,
        title: lesson.title,
        duration: lesson.duration,
        course: lesson.course,
        type: 'lesson',
      }))

      results.push(...instructorLessonResults)

      // Search students enrolled in instructor's courses
      const studentEnrollments = await Enrollment.find({
        course: { $in: instructorCourseIds },
      })
        .populate('student', 'name email avatar')
        .populate('course', 'title')
        .lean()

      const uniqueStudents = new Map()

      studentEnrollments.forEach((enrollment) => {
        if (enrollment.student && !uniqueStudents.has(enrollment.student._id.toString())) {
          uniqueStudents.set(enrollment.student._id.toString(), {
            _id: enrollment.student._id,
            title: enrollment.student.name,
            email: enrollment.student.email,
            avatar: enrollment.student.avatar,
            type: 'student',
          })
        }
      })

      console.log(`Found ${uniqueStudents.size} students for instructor`)

      results.push(...Array.from(uniqueStudents.values()))
    }

    // Admin Search Logic
    else if (userRole === 'admin') {
      console.log('Performing admin search...')

      // Search all courses
      const allCourses = await Course.find(searchOptions)
        .select('title slug category status isPublished instructor')
        .populate('instructor', 'name')
        .lean()

      console.log(`Found ${allCourses.length} courses for admin`)

      const courseResults = allCourses.map((course) => ({
        _id: course._id,
        title: course.title,
        slug: course.slug,
        category: course.category,
        isPublished: course.isPublished,
        type: 'course',
      }))

      results.push(...courseResults)

      // Search all lessons
      const allLessons = await Lesson.find(searchOptions)
        .select('title duration course order')
        .populate('course', 'title slug')
        .lean()

      console.log(`Found ${allLessons.length} lessons for admin`)

      const lessonResults = allLessons.map((lesson) => ({
        _id: lesson._id,
        title: lesson.title,
        duration: lesson.duration,
        course: lesson.course,
        type: 'lesson',
      }))

      results.push(...lessonResults)

      // Search all users (students and instructors)
      const users = await User.find({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
        ],
        role: { $in: ['student', 'instructor'] },
      })
        .select('name email avatar role')
        .lean()

      console.log(`Found ${users.length} users for admin`)

      const userResults = users.map((user) => ({
        _id: user._id,
        title: user.name,
        email: user.email,
        avatar: user.avatar,
        type: 'student', // Using "student" type for all users in frontend
        role: user.role,
      }))

      results.push(...userResults)
    }

    // Limit results and add scoring/ranking
    const limitedResults = results.slice(0, 20)

    console.log(`Total results found: ${limitedResults.length}`)

    // Add search tracking for users (optional)
    if (userRole === 'student' || userRole === 'instructor') {
      try {
        await User.findByIdAndUpdate(userId, {
          $addToSet: {
            recentSearches: {
              $each: [searchQuery],
              $slice: -10, // Keep only last 10 searches
            },
          },
        })
      } catch (updateError) {
        console.error('Error updating recent searches:', updateError)
      }
    }

    res.status(200).json({
      success: true,
      data: {
        results: limitedResults,
        total: limitedResults.length,
        query: searchQuery,
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message,
    })
  }
}

/**
 * Get recent searches for authenticated user
 */
exports.getRecentSearches = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('recentSearches')

    res.status(200).json({
      success: true,
      data: {
        recentSearches: user.recentSearches || [],
      },
    })
  } catch (error) {
    console.error('Get recent searches error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get recent searches',
      error: error.message,
    })
  }
}

/**
 * Clear recent searches for authenticated user
 */
exports.clearRecentSearches = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $set: { recentSearches: [] },
    })

    res.status(200).json({
      success: true,
      message: 'Recent searches cleared successfully',
    })
  } catch (error) {
    console.error('Clear recent searches error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to clear recent searches',
      error: error.message,
    })
  }
}

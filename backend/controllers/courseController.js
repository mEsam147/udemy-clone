const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const Enrollment = require('../models/Enrollment')
const User = require('../models/User')
const mongoose = require('mongoose')
const { sendNotification } = require('../services/notificationService')
const { cloudinary } = require('../config/cloudinary')

exports.getCourses = async (req, res, next) => {
  try {
    const {
      select,
      sort = '-createdAt',
      page = 1,
      limit = 12,
      search,
      category,
      level,
      minPrice,
      maxPrice,
      minRating,
      minDuration,
      maxDuration,
      language,
      features,
      instructor,
      status = 'published',
    } = req.query

    // Build query object
    let query = { isPublished: status === 'published' }

    // Text search across multiple fields
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'instructor.name': { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ]
    }

    // Filter conditions
    if (category) query.category = { $in: category.split(',') }
    if (level) query.level = { $in: level.split(',') }
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }
    if (minRating) query.rating = { $gte: Number(minRating) }
    if (minDuration || maxDuration) {
      query.duration = {}
      if (minDuration) query.duration.$gte = Number(minDuration)
      if (maxDuration) query.duration.$lte = Number(maxDuration)
    }
    if (language) query.language = language
    if (features) {
      query.features = { $all: features.split(',') }
    }
    if (instructor) query['instructor._id'] = instructor

    // Optimized query with lean and selective population
    let courseQuery = Course.find(query).sort(sort).lean()

    // Efficient population
    courseQuery = courseQuery.populate('instructor', 'name avatar bio')

    // Pagination
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))) // Cap at 50 for performance
    const skip = (pageNum - 1) * limitNum

    // Parallel execution for better performance
    const [courses, total, featuredCourses] = await Promise.all([
      courseQuery.skip(skip).limit(limitNum),
      Course.countDocuments(query),
      // Get featured courses for cache warming
      pageNum === 1
        ? Course.find({ ...query, isFeatured: true })
            .limit(4)
            .select('title thumbnail price rating')
            .lean()
        : Promise.resolve([]),
    ])

    const totalPages = Math.ceil(total / limitNum)

    // Response optimization
    res.set('Cache-Control', 'public, max-age=300') // 5 minutes cache
    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
        nextPage: pageNum < totalPages ? pageNum + 1 : null,
        prevPage: pageNum > 1 ? pageNum - 1 : null,
      },
      data: courses,
      // Include featured courses on first page for better UX
      ...(pageNum === 1 && { featured: featuredCourses }),
    })
  } catch (error) {
    console.error('Get courses error:', error)
    next(error)
  }
}

// @desc    Get single course
// @route   GET /api/courses/:slug
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const { identifier } = req.params

    // Determine if the identifier is a valid MongoDB ObjectId
    const isObjectId = mongoose.isValidObjectId(identifier)

    // Query the course by slug or ID
    const course = await Course.findOne({
      [isObjectId ? '_id' : 'slug']: identifier,
    })
      .populate('instructor', 'name avatar bio expertise')
      .populate('lessons')

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    // Authorization check for unpublished courses
    if (
      !course.isPublished &&
      (!req.user || (req.user.role !== 'admin' && course.instructor._id.toString() !== req.user.id))
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this course',
      })
    }

    res.status(200).json({ success: true, data: course })
  } catch (error) {
    next(error)
  }
}

exports.createCourseWithLessons = async (req, res, next) => {
  let uploadedImagePublicId = null
  let uploadedVideoPublicIds = []
  try {
    console.log('Request Headers:', JSON.stringify(req.headers, null, 2))
    console.log('Files received:', JSON.stringify(req.files, null, 2))
    console.log('Body received:', JSON.stringify(req.body, null, 2))

    if (!req.files || !req.files.image || !req.files.image[0]) {
      return res.status(400).json({ success: false, message: 'Course image is required' })
    }
    if (!req.body.title || !req.body.description || !req.body.price || !req.body.category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, price, or category',
      })
    }

    const courseData = {
      ...req.body,
      instructor: req.user.id,
      image: req.files.image[0].path,
    }

    if (req.body.requirements) {
      courseData.requirements = Array.isArray(req.body.requirements)
        ? req.body.requirements
        : typeof req.body.requirements === 'string'
        ? JSON.parse(req.body.requirements)
        : [req.body.requirements]
    }
    if (req.body.whatYoullLearn) {
      courseData.whatYoullLearn = Array.isArray(req.body.whatYoullLearn)
        ? req.body.whatYoullLearn
        : typeof req.body.whatYoullLearn === 'string'
        ? JSON.parse(req.body.whatYoullLearn)
        : [req.body.whatYoullLearn]
    }

    console.log('Creating course with data:', JSON.stringify(courseData, null, 2))
    const course = await Course.create(courseData)
    console.log('Course created:', course._id)
    uploadedImagePublicId = req.files.image[0].public_id

    let lessonsCreated = 0
    if (req.body.lessons) {
      let lessonsData
      try {
        lessonsData =
          typeof req.body.lessons === 'string' ? JSON.parse(req.body.lessons) : req.body.lessons
        if (!Array.isArray(lessonsData)) lessonsData = []
      } catch (error) {
        await cloudinary.uploader.destroy(uploadedImagePublicId, {
          resource_type: 'image',
        })
        return res.status(400).json({ success: false, message: 'Invalid lessons format' })
      }

      const videoFiles = req.files['lessonVideos[]'] || []
      console.log(
        'Video files detected:',
        JSON.stringify(
          videoFiles.map((f) => f.originalname),
          null,
          2
        )
      )
      if (lessonsData.length > 0 && videoFiles.length !== lessonsData.length) {
        await cloudinary.uploader.destroy(uploadedImagePublicId, {
          resource_type: 'image',
        })
        await course.deleteOne()
        return res.status(400).json({
          success: false,
          message: `Number of lesson videos (${videoFiles.length}) must match number of lessons (${lessonsData.length})`,
        })
      }

      for (let i = 0; i < lessonsData.length; i++) {
        const videoFile = videoFiles[i]
        console.log(`Processing video ${i + 1}:`, videoFile.originalname)
        uploadedVideoPublicIds.push(videoFile.public_id)

        const lesson = await Lesson.create({
          title: lessonsData[i].title,
          duration: (lessonsData[i].duration || 0) * 60,
          order: lessonsData[i].order || i + 1,
          course: course._id,
          video: {
            public_id: videoFile.public_id,
            url: videoFile.path,
            format: videoFile.mimetype.split('/')[1],
            bytes: videoFile.size,
          },
        })
        console.log(`Lesson ${i + 1} created:`, lesson._id)
        lessonsCreated++
      }

      course.lecturesCount = await Lesson.countDocuments({
        course: course._id,
      })
      const durationResult = await Lesson.aggregate([
        { $match: { course: course._id } },
        { $group: { _id: null, total: { $sum: '$duration' } } },
      ])
      course.totalHours = durationResult.length > 0 ? durationResult[0].total / 3600 : 0
      await course.save()
    }

    res.status(201).json({
      success: true,
      data: course,
      message:
        lessonsCreated > 0
          ? `Course created with ${lessonsCreated} lessons and videos uploaded.`
          : 'Course created successfully.',
    })
  } catch (error) {
    console.error('Controller Error:', error)
    if (uploadedImagePublicId) {
      await cloudinary.uploader.destroy(uploadedImagePublicId, {
        resource_type: 'image',
      })
    }
    for (const publicId of uploadedVideoPublicIds) {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
    }
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'DuplicateCourseError',
        message: `A course with a similar title already exists. Please choose a unique title.`,
      })
    }
    if (error.statusCode === 413) {
      return res.status(413).json({
        success: false,
        error: 'PayloadTooLargeError',
        message: 'The video file is too large. Please upload a file smaller than 100MB.',
      })
    }
    res.status(error.http_code || 500).json({
      success: false,
      error: error.name || 'Server Error',
      message: error.message || 'Something went wrong',
    })
  }
}

exports.createCourse = async (req, res, next) => {
  let uploadedImagePublicId = null
  try {
    console.log('Request Headers:', JSON.stringify(req.headers, null, 2))
    console.log('File received:', JSON.stringify(req.file, null, 2))
    console.log('Body received:', JSON.stringify(req.body, null, 2))

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Course image is required' })
    }
    if (!req.body.title || !req.body.description || !req.body.price || !req.body.category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, price, or category',
      })
    }

    uploadedImagePublicId = req.file.filename

    const courseData = {
      ...req.body,
      instructor: req.user.id,
      image: req.file.path,
    }

    if (req.body.requirements) {
      courseData.requirements = Array.isArray(req.body.requirements)
        ? req.body.requirements
        : typeof req.body.requirements === 'string'
        ? JSON.parse(req.body.requirements)
        : [req.body.requirements]
    }
    if (req.body.whatYoullLearn) {
      courseData.whatYoullLearn = Array.isArray(req.body.whatYoullLearn)
        ? req.body.whatYoullLearn
        : typeof req.body.whatYoullLearn === 'string'
        ? JSON.parse(req.body.whatYoullLearn)
        : [req.body.whatYoullLearn]
    }

    console.log('Creating course with data:', JSON.stringify(courseData, null, 2))
    const course = await Course.create(courseData)
    console.log('Course created:', course._id)

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully.',
    })
  } catch (error) {
    console.error('Controller Error:', error)
    if (uploadedImagePublicId) {
      await cloudinary.uploader.destroy(uploadedImagePublicId, {
        resource_type: 'image',
      })
    }
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'DuplicateCourseError',
        message: 'A course with a similar title already exists. Please choose a unique title.',
      })
    }
    res.status(error.http_code || 500).json({
      success: false,
      error: error.name || 'Server Error',
      message: error.message || 'Something went wrong',
    })
  }
}
exports.createLesson = async (req, res, next) => {
  let uploadedVideoPublicId = null
  try {
    console.log('Request Headers:', JSON.stringify(req.headers, null, 2))
    console.log('Files received:', JSON.stringify(req.files, null, 2))
    console.log('Body received:', JSON.stringify(req.body, null, 2))

    const { courseId } = req.params
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to add lessons to this course',
      })
    }

    if (!req.files || !req.files.video) {
      return res.status(400).json({ success: false, message: 'Lesson video is required' })
    }
    if (!req.body.title || !req.body.duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title or duration',
      })
    }

    const videoFile = Array.isArray(req.files.video) ? req.files.video[0] : req.files.video
    const validVideoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv', '.webm']
    const extension = videoFile.name.toLowerCase().slice(videoFile.name.lastIndexOf('.'))
    if (
      !videoFile.mimetype.match(/video\/(mp4|mov|avi|wmv|flv|mkv|webm)/i) &&
      !(
        videoFile.mimetype === 'application/octet-stream' &&
        validVideoExtensions.includes(extension)
      )
    ) {
      return res.status(400).json({
        success: false,
        error: 'InvalidFileTypeError',
        message: 'Only video files are allowed for lessons (MP4, MOV, AVI, WMV, FLV, MKV, WEBM).',
      })
    }

    console.log(
      `Uploading video: ${videoFile.name} (${(videoFile.size / (1024 * 1024)).toFixed(2)}MB)`
    )
    const videoResult = await cloudinary.uploader.upload(videoFile.tempFilePath, {
      folder: 'courses',
      resource_type: 'video',
    })
    uploadedVideoPublicId = videoResult.public_id

    const lesson = await Lesson.create({
      title: req.body.title,
      duration: req.body.duration * 60,
      order: req.body.order || (await Lesson.countDocuments({ course: courseId })) + 1,
      course: courseId,
      video: {
        public_id: videoResult.public_id,
        url: videoResult.secure_url,
        format: videoResult.format || videoFile.name.split('.').pop(),
        bytes: videoResult.bytes,
      },
    })
    console.log('Lesson created:', lesson._id)

    course.lecturesCount = await Lesson.countDocuments({ course: course._id })
    const durationResult = await Lesson.aggregate([
      { $match: { course: course._id } },
      { $group: { _id: null, total: { $sum: '$duration' } } },
    ])
    course.totalHours = durationResult.length > 0 ? durationResult[0].total / 3600 : 0
    await course.save()

    res.status(201).json({
      success: true,
      data: lesson,
      message: 'Lesson created successfully.',
    })
  } catch (error) {
    console.error('Controller Error:', error)
    if (uploadedVideoPublicId) {
      await cloudinary.uploader.destroy(uploadedVideoPublicId, {
        resource_type: 'video',
      })
    }
    if (error.message.includes('Unexpected end of form')) {
      return res.status(400).json({
        success: false,
        error: 'FormDataError',
        message: 'Invalid form data. Please check your input and try again.',
      })
    }
    res.status(error.http_code || 500).json({
      success: false,
      error: error.name || 'Server Error',
      message: error.message || 'Something went wrong',
    })
  }
}

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor/Admin
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      })
    }

    const wasPublished = course.isPublished
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    await sendNotification({
      userId: req.user.id,
      type: 'COURSE_UPDATED',
      message: `You updated the course: "${course.title}"`,
      courseId: course._id,
      email: req.user.email,
      pushToken: req.user.pushToken,
    })

    if (wasPublished !== course.isPublished) {
      const admins = await User.find({ role: 'admin' })
      for (const admin of admins) {
        await sendNotification({
          userId: admin._id,
          type: 'COURSE_UPDATED',
          message: `Course "${course.title}" publication status changed to ${
            course.isPublished ? 'published' : 'unpublished'
          }`,
          courseId: course._id,
          email: admin.email,
          pushToken: admin.pushToken,
        })
      }
    }

    res.status(200).json({ success: true, data: course })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor/Admin
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course',
      })
    }

    await course.deleteOne()

    await sendNotification({
      userId: req.user.id,
      type: 'COURSE_DELETED',
      message: `You deleted the course: "${course.title}"`,
      courseId: course._id,
      email: req.user.email,
      pushToken: req.user.pushToken,
    })

    res.status(200).json({ success: true, data: {} })
  } catch (error) {
    next(error)
  }
}

exports.getCourseLessons = async (req, res, next) => {
  try {
    console.log('Course ID:', req.params.id)
    console.log('User:', req.user ? req.user.email : 'No user')
    console.log('User Role:', req.user ? req.user.role : 'No role')
    const course = await Course.findById(req.params.id)
    console.log('Course:', course)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    const lessons = await Lesson.find({ course: req.params.id }).sort('order')
    res.status(200).json({ success: true, data: lessons })
  } catch (error) {
    console.error('Error in getCourseLessons:', error.message)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

exports.addLesson = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add lessons to this course',
      })
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Video file is required' })
    }

    const lessonData = {
      ...req.body,
      course: req.params.id,
      video: {
        public_id: req.file.filename, // public_id from CloudinaryStorage
        url: req.file.path,
        format: req.file.mimetype.split('/')[1],
        bytes: req.file.size,
      },
    }

    if (!lessonData.order) {
      const lessonCount = await Lesson.countDocuments({
        course: req.params.id,
      })
      lessonData.order = lessonCount + 1
    }

    const lesson = await Lesson.create(lessonData)

    course.lecturesCount = await Lesson.countDocuments({
      course: req.params.id,
    })
    course.totalHours =
      (
        await Lesson.aggregate([
          { $match: { course: course._id } },
          { $group: { _id: null, total: { $sum: '$duration' } } },
        ])
      )[0]?.total / 3600 || 0

    await course.save()

    await sendNotification({
      userId: req.user.id,
      type: 'LESSON_ADDED',
      message: `You added a new lesson to "${course.title}"`,
      courseId: course._id,
      email: req.user.email,
      pushToken: req.user.pushToken,
    })

    res.status(201).json({ success: true, data: lesson })
  } catch (error) {
    if (req.file && req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename, {
        resource_type: 'video',
      })
    }
    next(error)
  }
}

exports.updateLesson = async (req, res, next) => {
  try {
    let lesson = await Lesson.findById(req.params.lessonId)
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' })
    }

    const course = await Course.findById(lesson.course)
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lesson',
      })
    }

    const updateData = { ...req.body }
    // Preserve existing video data if no new video is uploaded
    if (!req.file) {
      updateData.video = lesson.video // Retain the existing video object
    } else {
      // Delete the old video from Cloudinary if it exists
      if (lesson.video && lesson.video.public_id) {
        await cloudinary.uploader.destroy(lesson.video.public_id, {
          resource_type: 'video',
        })
      }
      // Add new video data
      updateData.video = {
        public_id: req.file.public_id || req.file.filename,
        url: req.file.path,
        format: req.file.mimetype.split('/')[1],
        bytes: req.file.size,
      }
    }

    lesson = await Lesson.findByIdAndUpdate(req.params.lessonId, updateData, {
      new: true,
      runValidators: true,
    })

    await sendNotification({
      userId: req.user.id,
      type: 'LESSON_UPDATED',
      message: `You updated a lesson in "${course.title}"`,
      courseId: course._id,
      email: req.user.email,
      pushToken: req.user.pushToken,
    })

    res.status(200).json({ success: true, data: lesson })
  } catch (error) {
    // Clean up uploaded file in case of error
    if (req.file && req.file.public_id) {
      await cloudinary.uploader.destroy(req.file.public_id, {
        resource_type: 'video',
      })
    }
    next(error)
  }
}

exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId)
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' })
    }

    const course = await Course.findById(lesson.course)
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lesson',
      })
    }

    if (lesson.video && lesson.video.public_id) {
      await cloudinary.uploader.destroy(lesson.video.public_id, {
        resource_type: 'video',
      })
    }

    await lesson.deleteOne()

    course.lecturesCount = await Lesson.countDocuments({
      course: req.params.id,
    })
    course.totalHours =
      (
        await Lesson.aggregate([
          { $match: { course: course._id } },
          { $group: { _id: null, total: { $sum: '$duration' } } },
        ])
      )[0]?.total / 3600 || 0

    await course.save()

    await sendNotification({
      userId: req.user.id,
      type: 'LESSON_DELETED',
      message: `You deleted a lesson from "${course.title}"`,
      courseId: course._id,
      email: req.user.email,
      pushToken: req.user.pushToken,
    })

    res.status(200).json({ success: true, data: {} })
  } catch (error) {
    next(error)
  }
}

exports.getVideoUrl = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId)
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' })
    }

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: lesson.course,
    })

    const course = await Course.findById(lesson.course)
    const isInstructor = course.instructor.toString() === req.user.id
    const isAdmin = req.user.role === 'admin'

    if (!enrollment && !isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video',
      })
    }

    const signedUrl = cloudinary.url(lesson.video.public_id, {
      resource_type: 'video',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      sign_url: true,
    })

    res.status(200).json({ success: true, data: { videoUrl: signedUrl } })
  } catch (error) {
    next(error)
  }
}
exports.getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).lean()
    res.status(200).json({ success: true, data: courses })
  } catch (error) {
    next(error)
  }
}

exports.updateInstructorApplication = async (req, res, next) => {
  try {
    const { status } = req.body
    const user = await User.findById(req.params.userId)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (user.instructorApplication.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been processed',
      })
    }

    user.instructorApplication.status = status
    if (status === 'approved') {
      user.role = 'instructor'
    }

    await user.save()
    res.status(200).json({ success: true, message: `Application ${status}` })
  } catch (error) {
    next(error)
  }
}

exports.enrollCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    if (!course.isPublished) {
      return res.status(400).json({ success: false, message: 'Course is not published' })
    }

    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.id,
    })

    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' })
    }

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: req.params.id,
    })

    course.studentsEnrolled += 1
    await course.save()

    await sendNotification({
      userId: req.user.id,
      type: 'ENROLLMENT',
      message: `You have successfully enrolled in "${course.title}"!`,
      courseId: course._id,
      email: req.user.email,
      pushToken: req.user.pushToken,
    })

    const instructor = await User.findById(course.instructor)
    await sendNotification({
      userId: course.instructor,
      type: 'ENROLLMENT',
      message: `A new student enrolled in your course "${course.title}"!`,
      courseId: course._id,
      email: instructor.email,
      pushToken: instructor.pushToken,
    })

    res.status(201).json({ success: true, data: enrollment })
  } catch (error) {
    next(error)
  }
}

exports.getEnrolledCourses = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user.id,
    }).populate({
      path: 'course',
      populate: { path: 'instructor', select: 'name avatar' },
    })

    const courses = enrollments.map((enrollment) => enrollment.course)
    res.status(200).json({ success: true, count: courses.length, data: courses })
  } catch (error) {
    next(error)
  }
}

exports.getCourseProgress = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.id,
    }).populate('completedLessons')

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Not enrolled in this course' })
    }

    res.status(200).json({ success: true, data: enrollment })
  } catch (error) {
    next(error)
  }
}

exports.updateProgress = async (req, res, next) => {
  try {
    const { lessonId, completed } = req.body
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.id,
    })

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Not enrolled in this course' })
    }

    const lesson = await Lesson.findById(lessonId)
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' })
    }

    if (lesson.course.toString() !== req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Lesson does not belong to this course',
      })
    }

    if (completed) {
      if (!enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId)
        const course = await Course.findById(req.params.id)
        await sendNotification({
          userId: req.user.id,
          type: 'LESSON_COMPLETED',
          message: `You completed a lesson in "${course.title}"!`,
          courseId: course._id,
          email: req.user.email,
          pushToken: req.user.pushToken,
        })
      }
    } else {
      enrollment.completedLessons = enrollment.completedLessons.filter(
        (id) => id.toString() !== lessonId
      )
    }

    const totalLessons = await Lesson.countDocuments({ course: req.params.id })
    enrollment.progress =
      totalLessons > 0 ? Math.round((enrollment.completedLessons.length / totalLessons) * 100) : 0

    enrollment.lastAccessed = new Date()
    await enrollment.save()

    res.status(200).json({ success: true, data: enrollment })
  } catch (error) {
    next(error)
  }
}

exports.addReview = async (req, res, next) => {
  try {
    const { rating, review } = req.body
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.id,
    })

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Not enrolled in this course' })
    }

    if (enrollment.rating) {
      return res.status(400).json({ success: false, message: 'Already reviewed this course' })
    }

    enrollment.rating = {
      score: rating,
      review,
      ratedAt: new Date(),
    }
    await enrollment.save()

    const course = await Course.findById(req.params.id)
    const enrollmentsWithRating = await Enrollment.find({
      course: req.params.id,
      'rating.score': { $exists: true },
    })

    course.ratings.average =
      enrollmentsWithRating.reduce((sum, enrollment) => sum + enrollment.rating.score, 0) /
      enrollmentsWithRating.length
    course.ratings.count = enrollmentsWithRating.length
    await course.save()

    const instructor = await User.findById(course.instructor)
    await sendNotification({
      userId: course.instructor,
      type: 'REVIEW_ADDED',
      message: `A new review (${rating}/5) was added to your course "${course.title}"!`,
      courseId: course._id,
      email: instructor.email,
      pushToken: instructor.pushToken,
    })

    res.status(200).json({ success: true, data: enrollment })
  } catch (error) {
    next(error)
  }
}

exports.searchCourses = async (req, res, next) => {
  try {
    const {
      query,
      category,
      level,
      minPrice,
      maxPrice,
      minRating,
      minDuration,
      maxDuration,
      language,
      features,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = req.query

    console.log('Search filters received:', {
      query,
      category,
      level,
      minPrice,
      maxPrice,
      minRating,
      minDuration,
      maxDuration,
      language,
      features,
      sortBy,
      page,
      limit,
    })

    // Build filter object
    const filter = {}

    // Access control - only show published courses for public/non-admin users
    if (!req.user || req.user.role !== 'admin') {
      filter.status = 'published'
      filter.isPublished = true
    }

    // Text search
    if (query && query.trim().length > 0) {
      const searchTerm = query.trim()
      filter.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { subtitle: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
      ]
    }

    // Category filter
    if (category && category.length > 0) {
      if (Array.isArray(category)) {
        filter.category = { $in: category }
      } else {
        filter.category = { $regex: category, $options: 'i' }
      }
    }

    // Level filter
    if (level && level.length > 0) {
      if (Array.isArray(level)) {
        filter.level = { $in: level }
      } else {
        filter.level = level
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
    }

    // Duration range filter - use totalHours from your model
    if (minDuration || maxDuration) {
      filter.totalHours = {}
      if (minDuration) filter.totalHours.$gte = parseFloat(minDuration)
      if (maxDuration) filter.totalHours.$lte = parseFloat(maxDuration)
    }

    // Rating filter
    if (minRating) {
      filter['ratings.average'] = { $gte: parseFloat(minRating) }
    }

    // Language filter
    if (language && language !== 'all') {
      filter.language = { $regex: language, $options: 'i' }
    }

    // Features filter (if you add features field to your model)
    if (features && features.length > 0) {
      if (Array.isArray(features)) {
        filter.features = { $in: features }
      } else {
        filter.features = features
      }
    }

    console.log('Final MongoDB filter:', JSON.stringify(filter, null, 2))

    // Build sort object
    let sort = {}
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 }
        break
      case 'popular':
        sort = { studentsEnrolled: -1 }
        break
      case 'rating':
        sort = { 'ratings.average': -1 }
        break
      case 'price-low':
        sort = { price: 1 }
        break
      case 'price-high':
        sort = { price: -1 }
        break
      case 'duration-short':
        sort = { totalHours: 1 }
        break
      case 'duration-long':
        sort = { totalHours: -1 }
        break
      default:
        sort = { createdAt: -1 }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)))
    const skip = (pageNum - 1) * limitNum

    // Execute query
    const [courses, totalCount] = await Promise.all([
      Course.find(filter)
        .populate('instructor', 'name avatar')
        .select(
          'title subtitle description image price category level studentsEnrolled ratings instructor totalHours language createdAt'
        )
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),

      Course.countDocuments(filter),
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum)
    const hasNextPage = pageNum < totalPages
    const hasPrevPage = pageNum > 1

    console.log(`Search results: ${courses.length} courses found out of ${totalCount}`)

    // Format response to match frontend expectations
    const results = courses.map((course) => ({
      id: course._id,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      image: course.image,
      price: course.price,
      category: course.category,
      level: course.level,
      studentsEnrolled: course.studentsEnrolled || 0,
      ratings: course.ratings || { average: 0, count: 0 },
      instructor: course.instructor,
      duration: course.totalHours, // Map totalHours to duration for frontend
      isEnrolled: false, // You can add enrollment check if needed
      createdAt: course.createdAt,
    }))

    res.status(200).json({
      success: true,
      data: results,
      count: results.length,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage,
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    next(error)
  }
}
// Alternative: If you want to use MongoDB text search (requires text index)
exports.searchCoursesWithTextIndex = async (req, res, next) => {
  try {
    const { query, limit = 20, page = 1 } = req.query

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      })
    }

    const searchTerm = query.trim()

    if (searchTerm.length < 2) {
      return res.status(200).json({
        success: true,
        data: { courses: [] },
        count: 0,
      })
    }

    // Build access filter
    let accessFilter = {}
    if (req.user?.role === 'student') {
      accessFilter = {
        $or: [{ isPublished: true }, { 'enrollments.user': req.user._id }],
      }
    } else if (req.user?.role === 'instructor') {
      accessFilter = { instructor: req.user._id }
    } else if (!req.user) {
      accessFilter = { isPublished: true }
    }

    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const skip = (pageNum - 1) * limitNum

    // USING MONGODB TEXT SEARCH (requires text index)
    const textSearchFilter = {
      $text: { $search: searchTerm },
    }

    const finalFilter =
      Object.keys(accessFilter).length > 0
        ? { $and: [accessFilter, textSearchFilter] }
        : textSearchFilter

    console.time('TextSearchExecution')

    const [courses, totalCount] = await Promise.all([
      Course.find(finalFilter)
        .select({
          title: 1,
          subtitle: 1,
          description: 1,
          image: 1,
          price: 1,
          category: 1,
          level: 1,
          studentsEnrolled: 1,
          'ratings.average': 1,
          instructor: 1,
          duration: 1,
          score: { $meta: 'textScore' }, // This will work with $text search
        })
        .populate('instructor', 'name avatar')
        .sort({ score: { $meta: 'textScore' } }) // Sort by text search relevance
        .skip(skip)
        .limit(limitNum)
        .lean(),

      Course.countDocuments(finalFilter),
    ])

    console.timeEnd('TextSearchExecution')

    const results = courses.map((course) => ({
      id: course._id,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      image: course.image,
      price: course.price,
      category: course.category,
      level: course.level,
      studentsEnrolled: course.studentsEnrolled || 0,
      ratings: course.ratings || { average: 0, count: 0 },
      instructor: course.instructor,
      duration: course.duration,
      isEnrolled: false,
      relevanceScore: course.score || 0,
    }))

    const totalPages = Math.ceil(totalCount / limitNum)

    res.status(200).json({
      success: true,
      data: { courses: results },
      count: results.length,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNum,
      },
    })
  } catch (error) {
    console.error('Text search error:', error)
    next(error)
  }
}
// backend/controllers/courseController.js (updated dashboardSearch controller)
exports.dashboardSearch = async (req, res, next) => {
  try {
    const { query } = req.query
    const userId = req.user.id
    const role = req.user.role

    let courses = []
    let lessons = []
    let students = []

    // Search courses
    let courseFilter = { $text: { $search: query } }
    if (role === 'student') {
      courseFilter.$or = [{ isPublished: true }, { 'enrollments.user': userId }]
    } else if (role === 'instructor') {
      courseFilter.instructor = userId
    } // admin gets all

    courses = await Course.find(courseFilter)
      .populate('instructor', 'name')
      .populate({
        path: 'enrollments',
        match: { user: userId },
        select: '_id',
      })
      .select('title category isPublished image studentsEnrolled ratings')
      .lean()

    courses = courses.map((course) => ({
      ...course,
      isEnrolled: course.enrollments.length > 0,
      type: 'course',
    }))

    // Search lessons
    let lessonFilter = { $text: { $search: query } }
    let permittedCourses = []
    if (role === 'student') {
      permittedCourses = await Enrollment.find({ user: userId }).distinct('course')
      lessonFilter.course = { $in: permittedCourses }
    } else if (role === 'instructor') {
      permittedCourses = await Course.find({ instructor: userId }).distinct('_id')
      lessonFilter.course = { $in: permittedCourses }
    } // admin gets all, no filter on course

    lessons = await Lesson.find(lessonFilter)
      .populate({
        path: 'course',
        select: 'title slug instructor',
      })
      .select('title description duration order')
      .lean()

    lessons = lessons.map((lesson) => {
      const isOwnCourse =
        role === 'instructor' ? lesson.course.instructor.toString() === userId : true // for admins/students, assume true
      return { ...lesson, type: 'lesson', isOwnCourse }
    })

    // Search students (for instructor/admin)
    if (role === 'instructor' || role === 'admin') {
      let studentFilter = { $text: { $search: query }, role: 'student' }
      if (role === 'instructor') {
        const instructorCourses = await Course.find({
          instructor: userId,
        }).distinct('_id')
        studentFilter._id = {
          $in: await Enrollment.find({
            course: { $in: instructorCourses },
          }).distinct('user'),
        }
      }

      students = await User.find(studentFilter).select('name email avatar role').lean()

      students = students.map((student) => ({ ...student, type: 'student' }))
    }

    const results = [...courses, ...lessons, ...students]

    res.status(200).json({
      success: true,
      data: { results },
    })
  } catch (error) {
    next(error)
  }
}

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Course.distinct('category', { isPublished: true })
    res.status(200).json({ success: true, data: categories })
  } catch (error) {
    next(error)
  }
}

exports.getCourseReviews = async (req, res, next) => {
  try {
    const { id } = req.params // Explicitly use 'id' to match route parameter :id

    // Validate identifier
    if (!id) {
      console.log('No identifier provided in request')
      return res.status(400).json({
        success: false,
        message: 'Course identifier (ID or slug) is required',
      })
    }

    // Log the identifier for debugging
    console.log(
      `Fetching reviews for identifier: ${id} (isObjectId: ${mongoose.Types.ObjectId.isValid(id)})`
    )

    // Find course by ID or slug (case-insensitive for slug)
    const isObjectId = mongoose.Types.ObjectId.isValid(id)
    const course = await Course.findOne({
      [isObjectId ? '_id' : 'slug']: isObjectId ? id : id.toLowerCase(),
    }).populate('instructor', 'name')

    if (!course) {
      console.log(`Course not found for identifier: ${id}`)
      return res.status(404).json({
        success: false,
        message: `Course not found with ${isObjectId ? 'ID' : 'slug'}: ${id}`,
      })
    }

    // Authorization check
    if (
      !course.isPublished &&
      (!req.user || (req.user.role !== 'admin' && course.instructor._id.toString() !== req.user.id))
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access reviews for this unpublished course',
      })
    }

    // Get reviews with pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const enrollmentsWithReviews = await Enrollment.find({
      course: course._id,
      'rating.score': { $exists: true },
    })
      .populate('student', 'name avatar email')
      .sort('-rating.ratedAt')
      .skip(skip)
      .limit(limit)

    // Calculate total for pagination
    const totalReviews = await Enrollment.countDocuments({
      course: course._id,
      'rating.score': { $exists: true },
    })

    // Calculate average rating
    const totalRating = enrollmentsWithReviews.reduce(
      (sum, enrollment) => sum + enrollment.rating.score,
      0
    )
    const averageRating =
      enrollmentsWithReviews.length > 0 ? totalRating / enrollmentsWithReviews.length : 0

    // Calculate rating distribution
    const ratingDistribution = await Enrollment.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(course._id),
          'rating.score': { $exists: true },
        },
      },
      {
        $group: {
          _id: '$rating.score',
          count: { $sum: 1 },
        },
      },
    ])

    // Format rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingDistribution.forEach((item) => {
      distribution[item._id] = item.count
    })

    res.status(200).json({
      success: true,
      data: {
        reviews: enrollmentsWithReviews.map((enrollment) => ({
          id: enrollment._id,
          student: {
            id: enrollment.student._id,
            name: enrollment.student.name,
            avatar: enrollment.student.avatar,
            email: enrollment.student.email,
          },
          rating: enrollment.rating.score,
          review: enrollment.rating.review,
          ratedAt: enrollment.rating.ratedAt,
        })),
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalRatings: totalReviews,
        ratingDistribution: distribution,
        pagination: {
          page,
          limit,
          total: totalReviews,
          pages: Math.ceil(totalReviews / limit),
        },
      },
    })
  } catch (error) {
    console.error('Get course reviews error:', error)
    next(error)
  }
}

// @desc    Check if user is enrolled in a course
// @route   GET /api/courses/:id/enrolled
// @access  Private
exports.checkEnrollment = async (req, res, next) => {
  try {
    const courseId = req.params.id
    if (!courseId || !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    const isEnrolled = course.studentsEnrolled.includes(req.user._id)
    res.status(200).json({ success: true, data: { isEnrolled } })
  } catch (error) {
    next(error)
  }
}

exports.addToWishlist = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    const existingWishlistIndex = req.user.wishlist.findIndex(
      (courseId) => courseId.toString() === req.params.id
    )

    if (existingWishlistIndex !== -1) {
      return res.status(400).json({
        success: false,
        message: 'Course is already in your wishlist',
      })
    }

    req.user.wishlist.push(course._id)
    await req.user.save()

    await sendNotification({
      userId: req.user.id,
      type: 'WISHLIST_ADDED',
      message: `You added "${course.title}" to your wishlist!`,
      courseId: course._id,
      email: req.user.email,
      pushToken: req.user.pushToken,
    })

    res.status(200).json({
      success: true,
      message: 'Course added to wishlist successfully',
      data: {
        courseId: course._id,
        isInWishlist: true,
        wishlistCount: req.user.wishlist.length,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.removeFromWishlist = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    req.user.wishlist = req.user.wishlist.filter(
      (courseId) => courseId.toString() !== req.params.id
    )
    await req.user.save()

    await sendNotification({
      userId: req.user.id,
      type: 'WISHLIST_REMOVED',
      message: `You removed "${course.title}" from your wishlist.`,
      courseId: course._id,
      email: req.user.email,
      pushToken: req.user.pushToken,
    })

    res.status(200).json({
      success: true,
      message: 'Course removed from wishlist successfully',
      data: {
        courseId: course._id,
        isInWishlist: false,
        wishlistCount: req.user.wishlist.length,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.getWishlistStatus = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    if (!req.user) {
      return res.status(200).json({
        success: true,
        data: {
          isInWishlist: false,
          courseId: req.params.id,
          wishlistCount: 0,
        },
      })
    }

    const isInWishlist = req.user.wishlist.some((courseId) => courseId.toString() === req.params.id)

    res.status(200).json({
      success: true,
      data: {
        isInWishlist,
        courseId: req.params.id,
        wishlistCount: req.user.wishlist.length,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.getWishlist = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

    const wishlistCourses = await Course.find({
      _id: { $in: req.user.wishlist },
      isPublished: true,
    })
      .populate('instructor', 'name avatar')
      .select(
        'title slug image price ratings category level studentsEnrolled totalHours lecturesCount'
      )
      .sort({ updatedAt: -1 })
      .limit(20)

    res.status(200).json({
      success: true,
      count: wishlistCourses.length,
      data: wishlistCourses,
      totalWishlistCount: req.user.wishlist.length,
    })
  } catch (error) {
    next(error)
  }
}

exports.updateCourseStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const courseId = req.params.id

    console.log('status', status)

    const allowedStatuses = ['draft', 'published', 'archived']
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: draft, published, archived',
      })
    }

    // Find course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      })
    }

    const isInstructor =
      req.user.role === 'instructor' && course.instructor.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'

    if (!isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      })
    }

    // Additional validation for publishing
    if (status === 'published') {
      const validationErrors = []

      // Check if course has at least one lesson
      const lessonCount = Lesson.countDocuments({ course: courseId })
      if (lessonCount === 0) {
        validationErrors.push('Course must have at least one lesson')
      }

      // Check if course has a valid image
      if (!course.image) {
        validationErrors.push('Course must have a cover image')
      }

      // Check if course has a valid description
      if (!course.description || course.description.length < 50) {
        validationErrors.push('Course description must be at least 50 characters')
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot publish course',
          errors: validationErrors,
        })
      }
    }

    // Update course status
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        status,
        ...(status === 'published' && { publishedAt: new Date() }),
      },
      { new: true, runValidators: true }
    ).populate('instructor', 'name email')

    res.status(200).json({
      success: true,
      message: `Course status updated to ${status}`,
      data: updatedCourse,
    })
  } catch (error) {
    next(error)
  }
}
// @desc    Bulk update course status
// @route   PATCH /api/courses/bulk-status
// @access  Private (Instructor & Admin)
exports.bulkUpdateCourseStatus = async (req, res, next) => {
  try {
    const { courseIds, status } = req.body

    // Validate input
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Course IDs array is required',
      })
    }

    const allowedStatuses = ['draft', 'published', 'archived']
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: draft, published, archived',
      })
    }

    // Find courses and check permissions
    const courses = await Course.find({ _id: { $in: courseIds } })

    if (courses.length !== courseIds.length) {
      return res.status(404).json({
        success: false,
        message: 'Some courses not found',
      })
    }

    // Check permissions for each course
    const isAdmin = req.user.role === 'admin'
    const unauthorizedCourses = courses.filter((course) => {
      const isInstructor =
        req.user.role === 'instructor' && course.instructor.toString() === req.user._id.toString()
      return !isInstructor && !isAdmin
    })

    if (unauthorizedCourses.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update some courses',
        unauthorizedCourses: unauthorizedCourses.map((c) => c._id),
      })
    }

    // Bulk update
    const updateData = { status }
    if (status === 'published') {
      updateData.publishedAt = new Date()
    }

    const result = await Course.updateMany({ _id: { $in: courseIds } }, updateData)

    res.status(200).json({
      success: true,
      message: `Updated status for ${result.modifiedCount} courses to ${status}`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get course status statistics
// @route   GET /api/courses/status-stats
// @access  Private (Instructor & Admin)
exports.getCourseStatusStats = async (req, res, next) => {
  try {
    let matchCriteria = {}

    // If user is instructor, only show their courses
    if (req.user.role === 'instructor') {
      matchCriteria.instructor = req.user._id
    }
    // Admin can see all courses

    const stats = await Course.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalStudents: { $sum: '$studentsEnrolled' },
          totalRevenue: {
            $sum: {
              $multiply: ['$price', '$studentsEnrolled'],
            },
          },
        },
      },
    ])

    // Format the response
    const formattedStats = {
      draft: 0,
      published: 0,
      archived: 0,
      totalStudents: 0,
      totalRevenue: 0,
    }

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count
      formattedStats.totalStudents += stat.totalStudents
      formattedStats.totalRevenue += stat.totalRevenue
    })

    res.status(200).json({
      success: true,
      data: formattedStats,
    })
  } catch (error) {
    next(error)
  }
}

// controllers/courseController.js

// Get all instructors with stats
exports.getAllInstructors = async (req, res) => {
  try {
    // First, get all instructors
    const instructors = await User.find({ role: 'instructor' })
      .select('name email avatar instructorApplication createdAt')
      .lean()

    // Get courses for each instructor and calculate stats
    const instructorsWithStats = await Promise.all(
      instructors.map(async (instructor) => {
        // Get courses for this instructor
        const courses = await Course.find({
          instructor: instructor._id,
          status: 'published',
        }).select('title studentsEnrolled ratings price')

        // Calculate stats
        const totalStudents = courses.reduce(
          (sum, course) => sum + (course.studentsEnrolled || 0),
          0
        )
        const totalRevenue = courses.reduce(
          (sum, course) => sum + (course.price || 0) * (course.studentsEnrolled || 0),
          0
        )

        // Calculate average rating
        const coursesWithRatings = courses.filter((course) => course.ratings?.average > 0)
        const averageRating =
          coursesWithRatings.length > 0
            ? coursesWithRatings.reduce((sum, course) => sum + course.ratings.average, 0) /
              coursesWithRatings.length
            : 0

        return {
          ...instructor,
          courses: courses.length,
          students: totalStudents,
          revenue: totalRevenue,
          rating: parseFloat(averageRating.toFixed(1)),
          courseDetails: courses.map((course) => ({
            title: course.title,
            studentsEnrolled: course.studentsEnrolled,
            price: course.price,
            rating: course.ratings?.average || 0,
          })),
        }
      })
    )

    res.status(200).json({
      success: true,
      data: instructorsWithStats,
    })
  } catch (error) {
    console.error('Get all instructors error:', error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get instructor stats
exports.getInstructorStats = async (req, res) => {
  try {
    // Get total applications (all users with instructor applications)
    const totalApplications = await User.countDocuments({
      instructorApplication: { $exists: true },
    })

    const pendingApplications = await User.countDocuments({
      'instructorApplication.status': 'pending',
    })

    const approvedApplications = await User.countDocuments({
      'instructorApplication.status': 'approved',
    })

    const rejectedApplications = await User.countDocuments({
      'instructorApplication.status': 'rejected',
    })

    // Get all published courses by instructors
    const instructorCourses = await Course.find({
      status: 'published',
      instructor: { $exists: true },
    }).populate('instructor', 'name')

    // Calculate total students and revenue
    let totalStudents = 0
    let totalRevenue = 0
    let totalRating = 0
    let ratingCount = 0

    instructorCourses.forEach((course) => {
      totalStudents += course.studentsEnrolled || 0
      totalRevenue += (course.price || 0) * (course.studentsEnrolled || 0)

      if (course.ratings?.average && course.ratings.average > 0) {
        totalRating += course.ratings.average
        ratingCount++
      }
    })

    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0

    res.status(200).json({
      success: true,
      data: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications,
        totalStudents,
        totalRevenue,
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalCourses: instructorCourses.length,
        activeInstructors: await User.countDocuments({ role: 'instructor' }),
      },
    })
  } catch (error) {
    console.error('Get instructor stats error:', error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get instructor applications (fixed version)
exports.getInstructorApplications = async (req, res) => {
  try {
    const applications = await User.find({
      'instructorApplication.status': { $exists: true },
    })
      .select('name email avatar instructorApplication createdAt')
      .sort({ 'instructorApplication.submittedAt': -1 })

    console.log('ap;liactions', applications)
    // Format the response
    const formattedApplications = applications.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      instructorApplication: user?.instructorApplication,
      createdAt: user.createdAt,
    }))

    res.status(200).json({
      success: true,
      data: formattedApplications,
    })
  } catch (error) {
    console.error('Get instructor applications error:', error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update instructor application (fixed version)
exports.updateInstructorApplication = async (req, res) => {
  try {
    const { status } = req.body
    const { userId } = req.params

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    if (!user.instructorApplication) {
      return res.status(400).json({
        success: false,
        message: 'User does not have an instructor application',
      })
    }

    if (user.instructorApplication.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been processed',
      })
    }

    // Update application status
    user.instructorApplication.status = status
    user.instructorApplication.reviewedAt = new Date()
    user.instructorApplication.reviewedBy = req.user.id

    // If approved, update user role to instructor
    if (status === 'approved') {
      user.role = 'instructor'
    }

    await user.save()

    // Send notification (you can implement this separately)
    if (status === 'approved') {
      // Send approval notification
      console.log(`Instructor application approved for ${user.email}`)
    } else {
      // Send rejection notification
      console.log(`Instructor application rejected for ${user.email}`)
    }

    res.status(200).json({
      success: true,
      message: `Application ${status}`,
      data: {
        userId: user._id,
        status: user.instructorApplication.status,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Update instructor application error:', error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getInstructorStats = async (req, res) => {
  try {
    const total = await User.countDocuments({
      instructorApplication: { $exists: true },
    })
    const pending = await User.countDocuments({
      'instructorApplication.status': 'pending',
    })
    const approved = await User.countDocuments({
      'instructorApplication.status': 'approved',
    })
    const rejected = await User.countDocuments({
      'instructorApplication.status': 'rejected',
    })

    // Calculate total students and revenue from all instructor courses
    const instructors = await User.find({ role: 'instructor' }).populate('courses')
    let totalStudents = 0
    let totalRevenue = 0
    let totalRating = 0
    let ratingCount = 0

    instructors.forEach((instructor) => {
      instructor.courses?.forEach((course) => {
        totalStudents += course.studentsEnrolled || 0
        totalRevenue += (course.price || 0) * (course.studentsEnrolled || 0)
        if (course.ratings?.average) {
          totalRating += course.ratings.average
          ratingCount++
        }
      })
    })

    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        totalStudents,
        totalRevenue,
        averageRating: parseFloat(averageRating.toFixed(1)),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Optimized version using aggregation
exports.getAllInstructorsOptimized = async (req, res) => {
  try {
    const instructors = await User.aggregate([
      // Match only instructors
      { $match: { role: 'instructor' } },

      // Lookup their courses
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'instructor',
          as: 'courses',
        },
      },

      // Project only necessary fields
      {
        $project: {
          name: 1,
          email: 1,
          avatar: 1,
          instructorApplication: 1,
          createdAt: 1,
          'courses.title': 1,
          'courses.studentsEnrolled': 1,
          'courses.ratings.average': 1,
          'courses.price': 1,
        },
      },

      // Calculate stats
      {
        $addFields: {
          totalStudents: {
            $sum: '$courses.studentsEnrolled',
          },
          totalRevenue: {
            $sum: {
              $map: {
                input: '$courses',
                as: 'course',
                in: {
                  $multiply: [
                    { $ifNull: ['$$course.price', 0] },
                    { $ifNull: ['$$course.studentsEnrolled', 0] },
                  ],
                },
              },
            },
          },
          totalCourses: { $size: '$courses' },
          averageRating: {
            $avg: {
              $filter: {
                input: '$courses.ratings.average',
                as: 'rating',
                cond: { $gt: ['$$rating', 0] },
              },
            },
          },
        },
      },

      // Final projection
      {
        $project: {
          name: 1,
          email: 1,
          avatar: 1,
          instructorApplication: 1,
          createdAt: 1,
          students: '$totalStudents',
          revenue: '$totalRevenue',
          courses: '$totalCourses',
          rating: { $round: [{ $ifNull: ['$averageRating', 0] }, 1] },
          courseDetails: {
            $map: {
              input: '$courses',
              as: 'course',
              in: {
                title: '$$course.title',
                studentsEnrolled: '$$course.studentsEnrolled',
                price: '$$course.price',
                rating: { $ifNull: ['$$course.ratings.average', 0] },
              },
            },
          },
        },
      },

      // Sort by most students
      { $sort: { students: -1 } },
    ])

    res.status(200).json({
      success: true,
      data: instructors,
    })
  } catch (error) {
    console.error('Get all instructors optimized error:', error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

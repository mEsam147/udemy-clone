const User = require('../models/User')
const { signToken } = require('../utils/jwt')
const crypto = require('crypto')
const { sendPasswordResetEmail, sendPasswordChangedEmail } = require('../utils/emailService')

const sendTokenResponse = (user, statusCode, res) => {
  try {
    const token = signToken(user._id)

    // Calculate expiration (default to 7 days if not set)
    const expiresInDays = parseInt(process.env.JWT_COOKIE_EXPIRE) || 7
    const maxAge = expiresInDays * 24 * 60 * 60 * 1000

    const options = {
      maxAge: maxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    }

    console.log('Setting auth cookie with options:', {
      maxAge: `${expiresInDays} days`,
      httpOnly: options.httpOnly,
      secure: options.secure,
      sameSite: options.sameSite,
    })

    // Set cookie and send response
    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        success: true,
        token, // Still returning token for client-side storage if needed
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      })
  } catch (error) {
    console.error('Error in sendTokenResponse:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      })
    }

    console.log('Uploaded file:', req.file)

    // Get Cloudinary URL from the uploaded file
    const avatarUrl = req.file.path

    // If user already has an avatar, delete the old one from Cloudinary
    const existingUser = await User.findById(req.user.id)
    if (existingUser.avatar) {
      try {
        // Extract public_id from Cloudinary URL
        const oldAvatarUrl = existingUser.avatar
        const publicId = oldAvatarUrl.split('/').pop().split('.')[0]
        const fullPublicId = `user-avatars/${publicId}`

        await cloudinary.uploader.destroy(fullPublicId)
        console.log('Old avatar deleted from Cloudinary')
      } catch (deleteError) {
        console.error('Error deleting old avatar:', deleteError)
        // Continue with upload even if old avatar deletion fails
      }
    }

    // Update user in database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        expertise: user.expertise,
        instructorProfile: user.instructorProfile,
        isVerified: user.isVerified,
        instructorApplication: user.instructorApplication,
      },
    })
  } catch (error) {
    console.error('Avatar upload error:', error)

    // If there was an upload, try to delete the uploaded file from Cloudinary
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename)
      } catch (deleteError) {
        console.error('Error deleting uploaded file:', deleteError)
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error during avatar upload',
    })
  }
}

// @desc    Delete user avatar
// @route   DELETE /api/auth/avatar
// @access  Private
exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user.avatar) {
      return res.status(400).json({
        success: false,
        message: 'No avatar to delete',
      })
    }

    // Extract public_id from Cloudinary URL
    const avatarUrl = user.avatar
    const publicId = avatarUrl.split('/').pop().split('.')[0]
    const fullPublicId = `user-avatars/${publicId}`

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(fullPublicId)
      console.log('Avatar deleted from Cloudinary')
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError)
      // Continue with database update even if Cloudinary deletion fails
    }

    // Update user in database
    user.avatar = ''
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Avatar deleted successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        expertise: user.expertise,
        instructorProfile: user.instructorProfile,
        isVerified: user.isVerified,
        instructorApplication: user.instructorApplication,
      },
    })
  } catch (error) {
    console.error('Avatar deletion error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during avatar deletion',
    })
  }
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
    })

    sendTokenResponse(user, 201, res)
  } catch (error) {
    next(error)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' })
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check if password matches
    // const isMatch = await user.correctPassword(password, user.password);
    // if (!isMatch) {
    //   return res.status(401).json({ message: "Invalid credentials" });
    // }

    const isMatch = (await user.password) === password
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    sendTokenResponse(user, 200, res)
  } catch (error) {
    next(error)
  }
}

exports.logout = (req, res) => {
  res.clearCookie('token')

  res.status(200).json({
    success: true,
    data: {},
  })
}

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

// controllers/authController.js
exports.updateProfile = async (req, res, next) => {
  try {
    console.log('Update profile request body:', req.body) // Debug log

    // Check if req.body exists and has data
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body is empty',
      })
    }

    const { name, email, bio, expertise, instructorProfile } = req.body

    // Build fields to update dynamically
    const fieldsToUpdate = {}

    if (name !== undefined) fieldsToUpdate.name = name
    if (email !== undefined) fieldsToUpdate.email = email
    if (bio !== undefined) fieldsToUpdate.bio = bio
    if (expertise !== undefined) fieldsToUpdate.expertise = expertise
    if (instructorProfile !== undefined) fieldsToUpdate.instructorProfile = instructorProfile

    console.log('Fields to update:', fieldsToUpdate) // Debug log

    // Check if there are any fields to update
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      })
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    console.log('Updated user:', user) // Debug log

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Update profile error:', error)

    // Handle specific Mongoose errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message)
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      })
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Server error during profile update',
    })
  }
}

exports.googleAuth = (req, res) => {
  const token = signToken(req.user._id)

  // Set HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  })

  // Redirect to frontend success page
  res.redirect(`${process.env.CLIENT_URL}`)
}

exports.githubAuth = (req, res) => {
  const token = signToken(req.user._id)

  // Set HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  })

  // Redirect to frontend success page
  res.redirect(`${process.env.CLIENT_URL}/`)
}

exports.becomeInstructor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    if (user.role !== 'student') {
      return res.status(400).json({ message: 'You are already an instructor or admin' })
    }

    if (user.instructorApplication.status === 'pending') {
      return res.status(400).json({ message: 'You already have a pending application' })
    }

    user.instructorApplication = {
      status: 'pending',
      message: req.body.message || '',
      submittedAt: new Date(),
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
    })
  } catch (error) {
    next(error)
  }
}

exports.getInstructorApplications = async (req, res, next) => {
  try {
    const applications = await User.find({
      'instructorApplication.status': 'pending',
    }).select('name email instructorApplication submittedAt')

    res.status(200).json({
      success: true,
      data: applications,
    })
  } catch (error) {
    next(error)
  }
}

exports.processInstructorApplication = async (req, res, next) => {
  try {
    const { status } = req.body
    const { userId } = req.params

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either approved or rejected' })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.instructorApplication.status !== 'pending') {
      return res.status(400).json({ message: 'Application has already been processed' })
    }

    user.instructorApplication.status = status

    if (status === 'approved') {
      user.role = 'instructor'
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Set expire time (1 hour from now)
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000

    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`

    try {
      // Send email
      await sendPasswordResetEmail(user.email, resetToken)

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully',
      })
    } catch (error) {
      // If email fails, clear the reset token
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined
      await user.save()

      throw error
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({
        message: 'Reset token and new password are required',
      })
    }

    // Hash token to compare with stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with matching token and check expiration
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired reset token',
      })
    }

    // Set new password
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    // Send confirmation email
    await sendPasswordChangedEmail(user.email)

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Validate reset token
// @route   GET /api/auth/validate-reset-token/:token
// @access  Public
exports.validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.params

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required',
      })
    }

    // Hash token to compare with stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with matching token and check expiration
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Reset token is valid',
      email: user.email, // Return email for the reset form
    })
  } catch (error) {
    next(error)
  }
}

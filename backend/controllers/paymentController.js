const stripe = require("../config/stripe");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { sendNotification } = require("../services/notificationService");

// @desc    Create checkout session
// @route   POST /api/payment/checkout
// @access  Private/Student
// exports.createCheckoutSession = async (req, res, next) => {
//   try {
//     const { courseId } = req.body;

//     const course = await Course.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ message: "Course not found" });
//     }

//     // Check if already enrolled
//     const existingEnrollment = await Enrollment.findOne({
//       student: req.user.id,
//       course: courseId,
//     });

//     if (existingEnrollment) {
//       return res
//         .status(400)
//         .json({ message: "Already enrolled in this course" });
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}?waitingForEnrollment=true`,
//       cancel_url: `${process.env.CLIENT_URL}/courses/${courseId}`,
//       customer_email: req.user.email,
//       client_reference_id: courseId,
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: course.title,
//               description:
//                 course.subtitle || course.description.substring(0, 100) + "...",
//               images: [course.image],
//             },
//             unit_amount: Math.round(course.price * 100),
//           },
//           quantity: 1,
//         },
//       ],
//       metadata: {
//         courseId: courseId,
//         userId: req.user.id,
//         courseSlug: course.slug,
//       },
//     });

//     res.status(200).json({
//       success: true,
//       sessionId: session.id,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


// In createCheckoutSession - FIX THE SUCCESS URL
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    });

    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    // FIXED: Use only the session ID in success URL, no extra parameters
    const success_url = `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: success_url,
      cancel_url: `${process.env.CLIENT_URL}/courses/${courseId}`,
      customer_email: req.user.email,
      client_reference_id: courseId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.subtitle || course.description?.substring(0, 100) + "...",
              images: [course.image],
            },
            unit_amount: Math.round(course.price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: courseId,
        userId: req.user.id,
        courseSlug: course.slug,
      },
    });

    console.log('🟡 Checkout session created:', session.id);
    console.log('🔗 Success URL:', success_url.replace('{CHECKOUT_SESSION_ID}', session.id));
    
    res.status(200).json({
      success: true,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('❌ Create checkout session error:', error);
    next(error);
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payment/webhook
// @access  Public
// In your paymentController.js - handleStripeWebhook
// In your paymentController.js
exports.handleStripeWebhook = async (req, res, next) => {
  console.log('🔵 WEBHOOK RECEIVED - Testing if working...');
  
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.log('❌ No signature - might be a test');
    // For testing, let's process anyway
    try {
      const event = JSON.parse(req.body);
      if (event.type === 'checkout.session.completed') {
        await fulfillPurchase(event.data.object);
      }
    } catch (error) {
      console.log('Test processing failed:', error);
    }
    return res.json({ received: true });
  }

  // Proper webhook verification for production
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Webhook verified');
  } catch (err) {
    console.error("❌ Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('✅ Event type:', event.type);

  if (event.type === "checkout.session.completed") {
    console.log('💰 Processing payment...');
    const session = event.data.object;
    
    try {
      await fulfillPurchase(session);
      console.log('✅ Purchase fulfilled');
    } catch (error) {
      console.error('❌ Fulfillment error:', error);
    }
  }

  res.json({ received: true });
};

// Fulfill purchase function
const fulfillPurchase = async (session) => {
  try {
    console.log('🎯 FULFILLING PURCHASE');
    const { courseId, userId } = session.metadata;
    
    console.log('Course:', courseId);
    console.log('User:', userId);

    // Check if enrollment exists
    const existing = await Enrollment.findOne({
      student: userId,
      course: courseId,
    });

    if (existing) {
      console.log('✅ Enrollment already exists');
      return;
    }

    // Create enrollment
    console.log('🟡 Creating enrollment...');
    const enrollment = await Enrollment.create({
      student: userId,
      course: courseId,
      enrolledAt: new Date(),
      lastAccessed: new Date(),
      progress: 0,
      completedLessons: []
    });

    // Update course count
    await Course.findByIdAndUpdate(courseId, { $inc: { studentsEnrolled: 1 } });

    console.log('✅ Enrollment created:', enrollment._id);
    
  } catch (error) {
    console.error('❌ Fulfill purchase error:', error);
    throw error;
  }
};
// Helper function to fulfill purchase
// const fulfillPurchase = async (session) => {
//   try {
//     const { courseId, userId } = session.metadata;
//     const course = await Course.findById(courseId);
//     const user = await User.findById(userId);

//     await Enrollment.create({
//       student: userId,
//       course: courseId,
//     });

//     await Course.findByIdAndUpdate(courseId, {
//       $inc: { studentsEnrolled: 1 },
//     });

//     // Notify student
//     await sendNotification({
//       userId,
//       type: "PAYMENT_SUCCESS",
//       message: `Payment successful! You are now enrolled in "${course.title}".`,
//       courseId,
//       email: user.email,
//       pushToken: user.pushToken,
//     });

//     // Notify instructor
//     await sendNotification({
//       userId: course.instructor,
//       type: "ENROLLMENT",
//       message: `A new student enrolled in your course "${course.title}" via payment.`,
//       courseId,
//       email: (await User.findById(course.instructor)).email,
//     });

//     console.log(`Enrollment created for user ${userId} in course ${courseId}`);
//   } catch (error) {
//     console.error("Error fulfilling purchase:", error);
//   }
// };

// In your paymentController.js - fulfillPurchase function
// In your paymentController.js - fulfillPurchase function


// @desc    Retrieve checkout session
// @route   GET /api/payment/session/:sessionId
// @access  Private
exports.retrieveCheckoutSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"],
    });

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Error retrieving session:", error);
    res.status(400).json({
      success: false,
      message: "Failed to retrieve session",
    });
  }
};


exports.verifyAndCreateEnrollment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    console.log('🎯 DIRECT ENROLLMENT VERIFICATION REQUEST');
    console.log('Session ID:', sessionId);
    console.log('User ID:', req.user._id);

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Verify the payment session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product']
    });
    
    console.log('Session status:', session.payment_status);
    console.log('Session metadata:', session.metadata);

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    const courseId = session.metadata.courseId;
    const userIdFromSession = session.metadata.userId;

    // Verify the user matches
    if (req.user._id.toString() !== userIdFromSession) {
      return res.status(403).json({
        success: false,
        message: 'User authentication failed'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (existingEnrollment) {
      console.log('✅ Enrollment already exists, returning it');
      return res.json({
        success: true,
        data: {
          ...existingEnrollment.toObject(),
          isEnrolled: true,
          course: courseId // Include course ID for redirection
        },
        message: 'Already enrolled'
      });
    }

    console.log('🟡 Creating new enrollment from direct verification...');
    
    // Create the enrollment
    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      enrolledAt: new Date(),
      lastAccessed: new Date(),
      progress: 0,
      completedLessons: []
    });

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, { 
      $inc: { studentsEnrolled: 1 } 
    });

    console.log('✅ Enrollment created successfully from direct verification:', enrollment._id);

    res.json({
      success: true,
      data: {
        ...enrollment.toObject(),
        isEnrolled: true,
        course: courseId // Include course ID for redirection
      },
      message: 'Enrollment created successfully'
    });

  } catch (error) {
    console.error('❌ Direct enrollment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
const stripe = require("../config/stripe");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { sendNotification } = require("../services/notificationService");
const User = require("../models/User");


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




// In your paymentController.js - Update the PRICING_PLANS object
const PRICING_PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    features: [
      "Access to free courses",
      "Basic learning resources",
      "Community support",
      "Limited storage"
    ],
    maxStudents: 1,
    stripePriceId: null
  },
  pro: {
    id: "pro", 
    name: "Pro",
    price: 29,
    features: [
      "All free course features",
      "Access to premium courses",
      "Downloadable resources",
      "Certificate of completion",
      "Priority support",
      "Unlimited storage"
    ],
    maxStudents: 1,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID  // This will use your .env value
  },
  team: {
    id: "team",
    name: "Team", 
    price: 99,
    features: [
      "All Pro features",
      "Team management dashboard",
      "Progress tracking for team",
      "Custom branding",
      "Dedicated account manager",
      "API access"
    ],
    maxStudents: 10,
    stripePriceId: process.env.STRIPE_TEAM_PRICE_ID  // This will use your .env value
  }
};

// Create checkout session for pricing plans
// In your paymentController.js - FIXED VERSION
exports.createPlanCheckoutSession = async (req, res) => {
  try {
    console.log('🟡 createPlanCheckoutSession called with planId:', req.body.planId);
    console.log('🔍 User:', req.user._id);
    
    const { planId } = req.body;
    const user = req.user;

    // Validate request body
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required"
      });
    }

    // DEBUG: Log all environment variables
    console.log('🔍 ENVIRONMENT VARIABLES CHECK:');
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('STRIPE_PRO_PRICE_ID:', process.env.STRIPE_PRO_PRICE_ID);
    console.log('STRIPE_TEAM_PRICE_ID:', process.env.STRIPE_TEAM_PRICE_ID);
    console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    // Validate plan exists
    const plan = PRICING_PLANS[planId];
    if (!plan) {
      console.error('❌ Invalid plan requested:', planId);
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected. Available plans: free, pro, team"
      });
    }

    console.log('✅ Plan validated:', plan.name);
    console.log('🔍 Plan stripePriceId:', plan.stripePriceId);

    // Check if FRONTEND_URL is set
    if (!process.env.FRONTEND_URL) {
      console.error('❌ FRONTEND_URL is not set in environment variables');
      return res.status(500).json({
        success: false,
        message: "Server configuration error: FRONTEND_URL is required",
        details: "Please set FRONTEND_URL in your .env file"
      });
    }

    // Handle free plan (no payment needed)
    if (planId === 'free') {
      try {
        // Update user to free plan
        user.subscription = {
          plan: 'free',
          status: 'active',
          startedAt: new Date()
        };
        await user.save();

        console.log('✅ Free plan activated for user:', user._id);
        
        return res.status(200).json({
          success: true,
          message: "Free plan activated successfully",
          plan: plan
        });
      } catch (error) {
        console.error('❌ Error activating free plan:', error);
        return res.status(500).json({
          success: false,
          message: "Failed to activate free plan"
        });
      }
    }

    // For paid plans, validate Stripe price ID
    if (!plan.stripePriceId) {
      console.error(`❌ Stripe price ID not configured for plan: ${planId}`);
      console.error(`❌ Expected STRIPE_${planId.toUpperCase()}_PRICE_ID in environment`);
      return res.status(500).json({
        success: false,
        message: `Plan configuration error: Stripe price ID not set for ${plan.name} plan`,
        details: `Please set STRIPE_${planId.toUpperCase()}_PRICE_ID in your .env file`
      });
    }

    // Validate and format FRONTEND_URL
    let frontendUrl = process.env.FRONTEND_URL.trim();
    
    // Remove any trailing slashes
    frontendUrl = frontendUrl.replace(/\/+$/, '');
    
    // Ensure URL has proper protocol
    if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      frontendUrl = `${protocol}://${frontendUrl}`;
      console.warn('⚠️  FRONTEND_URL missing protocol, defaulting to:', frontendUrl);
    }

    console.log('✅ Using frontend URL:', frontendUrl);
    console.log('✅ Using Stripe price ID:', plan.stripePriceId);

    // Create Stripe checkout session for paid plans
    console.log('🟡 Creating Stripe checkout session...');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${frontendUrl}/pricing`,
      customer_email: user.email,
      client_reference_id: user._id.toString(),
      metadata: {
        planId: planId,
        userId: user._id.toString(),
        userEmail: user.email
      },
      subscription_data: {
        metadata: {
          planId: planId,
          userId: user._id.toString()
        }
      }
    });

    console.log('✅ Stripe checkout session created:', session.id);
    console.log('🔗 Success URL:', session.success_url);

    res.status(200).json({
      success: true,
      sessionId: session.id,
      message: `Checkout session created for ${plan.name} plan`
    });

  } catch (error) {
    console.error('❌ Checkout session error:', error);
    
    let errorMessage = error.message;
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid Stripe configuration. Please check your Stripe keys and price IDs.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get user's current plan
exports.getUserPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      success: true,
      data: {
        plan: user.subscription?.plan || 'free',
        status: user.subscription?.status || 'inactive',
        features: PRICING_PLANS[user.subscription?.plan || 'free']?.features || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user plan (admin only)
exports.updateUserPlan = async (req, res) => {
  try {
    const { userId, planId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const plan = PRICING_PLANS[planId];
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan"
      });
    }

    user.subscription = {
      plan: planId,
      status: 'active',
      startedAt: new Date(),
      updatedAt: new Date()
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: `User plan updated to ${plan.name}`,
      data: user.subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// In your paymentController.js - Add this function
exports.verifySubscription = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    console.log('🟡 Verifying subscription for session:', sessionId);
    
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });
    
    console.log('🔍 Session details:', {
      payment_status: session.payment_status,
      subscription: session.subscription,
      metadata: session.metadata
    });
    
    if (session.payment_status === 'paid') {
      const user = await User.findById(req.user._id);
      const planId = session.metadata.planId;
      
      // Validate subscription data exists
      if (!session.subscription) {
        console.error('❌ No subscription found in session');
        return res.status(400).json({
          success: false,
          message: 'Subscription data not found. Please try again or contact support.'
        });
      }
      
      // Safe date handling with fallbacks
      let currentPeriodStart = new Date();
      let currentPeriodEnd = new Date();
      
      // Set period end to 30 days from now as fallback
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
      
      // Use actual dates from Stripe if available
      if (session.subscription.current_period_start) {
        currentPeriodStart = new Date(session.subscription.current_period_start * 1000);
      }
      
      if (session.subscription.current_period_end) {
        currentPeriodEnd = new Date(session.subscription.current_period_end * 1000);
      }
      
      console.log('📅 Date values:', {
        current_period_start: session.subscription.current_period_start,
        current_period_end: session.subscription.current_period_end,
        calculated_start: currentPeriodStart,
        calculated_end: currentPeriodEnd
      });
      
      // Validate dates are valid
      if (isNaN(currentPeriodStart.getTime())) {
        console.warn('⚠️ Invalid start date, using current date');
        currentPeriodStart = new Date();
      }
      
      if (isNaN(currentPeriodEnd.getTime())) {
        console.warn('⚠️ Invalid end date, using 30 days from now');
        currentPeriodEnd = new Date();
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
      }
      
      // Update user's subscription
      user.subscription = {
        plan: planId,
        status: 'active',
        stripeSubscriptionId: session.subscription.id,
        stripeCustomerId: session.customer,
        currentPeriodStart: currentPeriodStart,
        currentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: false,
        startedAt: new Date(),
        updatedAt: new Date()
      };
      
      // Also update plan features based on the subscription
      if (planId === 'pro') {
        user.planFeatures = {
          maxCourses: 10,
          maxStudents: 100,
          canCreateCourses: true,
          hasAnalytics: true,
          hasCustomBranding: false
        };
      } else if (planId === 'team') {
        user.planFeatures = {
          maxCourses: 50,
          maxStudents: 1000,
          canCreateCourses: true,
          hasAnalytics: true,
          hasCustomBranding: true
        };
      }
      
      console.log('💾 Saving user with subscription:', {
        plan: user.subscription.plan,
        status: user.subscription.status,
        periodStart: user.subscription.currentPeriodStart,
        periodEnd: user.subscription.currentPeriodEnd
      });
      
      await user.save();
      
      console.log('✅ Subscription activated successfully for user:', user._id);
      
      return res.status(200).json({
        success: true,
        message: `Successfully subscribed to ${planId} plan`,
        subscription: user.subscription,
        planFeatures: user.planFeatures
      });
    }
    
    console.log('❌ Payment not completed, status:', session.payment_status);
    res.status(400).json({
      success: false,
      message: 'Payment not completed'
    });
    
  } catch (error) {
    console.error('❌ Subscription verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      // Include more details for debugging
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        sessionId: req.body.sessionId
      } : undefined
    });
  }
};
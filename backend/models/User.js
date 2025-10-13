const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },

    recentSearches: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "Recent searches cannot exceed 10 entries",
      },
    },

    pushToken: { type: String },
    avatar: {
      type: String,
      default: "",
    },
    googleId: String,
    githubId: String,
    bio: {
      type: String,
      maxlength: 500,
    },
    expertise: [
      {
        type: String,
        trim: true,
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    instructorApplication: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "none"],
        default: "none",
      },
      message: String,
      submittedAt: Date,
    },

    instructorStats: {
      totalStudents: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
      },
      totalCourses: {
        type: Number,
        default: 0,
      },
    },

    instructorProfile: {
      availability: {
        type: String,
        enum: [
          "within-1-hour",
          "within-24-hours",
          "within-48-hours",
          "within-1-week",
        ],
        default: "within-24-hours",
      },
      responseTime: String, // e.g., "Typically responds within 24 hours"
      officeHours: String, // e.g., "Mon-Fri, 9AM-5PM EST"
      contactEmail: String,
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      marketing: { type: Boolean, default: true },
      courseUpdates: { type: Boolean, default: true },
      newMessages: { type: Boolean, default: true },
    },
    language: {
      type: String,
      default: "en",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    privacySettings: {
      profileVisibility: {
        type: String,
        enum: ["public", "private", "connections"],
        default: "public",
      },
      showEmail: { type: Boolean, default: false },
      showEnrollments: { type: Boolean, default: true },
    },
    communicationSettings: {
      newsletter: { type: Boolean, default: true },
      productUpdates: { type: Boolean, default: true },
      courseRecommendations: { type: Boolean, default: true },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "banned"],
      default: "active",
    },

    // Deactivation fields
    deactivatedAt: Date,
    deactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deactivationReason: String,

    // Reactivation fields
    reactivatedAt: Date,
    reactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Suspension fields
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedAt: Date,
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    suspensionEnd: Date,
    suspensionReason: String,

    statusHistory: [
      {
        status: String,
        reason: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        notes: String,
      },
    ],
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "instructor",
});

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model("User", userSchema);

// // // const mongoose = require("mongoose");
// // // const slugify = require("slugify");

// // // const courseSchema = new mongoose.Schema(
// // //   {
// // //     title: {
// // //       type: String,
// // //       required: true,
// // //       trim: true,
// // //       maxlength: 100,
// // //     },
// // //     slug: { type: String, unique: true },
// // //     subtitle: {
// // //       type: String,
// // //       trim: true,
// // //       maxlength: 200,
// // //     },
// // //     description: {
// // //       type: String,
// // //       required: true,
// // //     },
// // //     instructor: {
// // //       type: mongoose.Schema.Types.ObjectId,
// // //       ref: "User",
// // //       required: true,
// // //     },
// // //     price: {
// // //       type: Number,
// // //       required: true,
// // //       min: 0,
// // //     },
// // //     image: {
// // //       type: String,
// // //       default: "",
// // //     },
// // //     category: {
// // //       type: String,
// // //       required: true,
// // //       trim: true,
// // //     },
// // //     subcategory: {
// // //       type: String,
// // //       trim: true,
// // //     },
// // //     level: {
// // //       type: String,
// // //       enum: ["Beginner", "Intermediate", "Advanced"],
// // //       default: "Beginner",
// // //     },
// // //     language: {
// // //       type: String,
// // //       default: "English",
// // //     },
// // //     ratings: {
// // //       average: {
// // //         type: Number,
// // //         default: 0,
// // //         min: 0,
// // //         max: 5,
// // //       },
// // //       count: {
// // //         type: Number,
// // //         default: 0,
// // //       },
// // //     },
// // //     studentsEnrolled: {
// // //       type: Number,
// // //       default: 0,
// // //     },
// // //     requirements: [
// // //       {
// // //         type: String,
// // //         trim: true,
// // //       },
// // //     ],
// // //     whatYoullLearn: [
// // //       {
// // //         type: String,
// // //         trim: true,
// // //       },
// // //     ],
// // //     totalHours: {
// // //       type: Number,
// // //       default: 0,
// // //     },
// // //     lecturesCount: {
// // //       type: Number,
// // //       default: 0,
// // //     },
// // //     isPublished: {
// // //       type: Boolean,
// // //       default: false,
// // //     },
// // //     publishedAt: Date,
// // //   },
// // //   {
// // //     timestamps: true,
// // //     toJSON: { virtuals: true },
// // //     toObject: { virtuals: true },
// // //   }
// // // );

// // // courseSchema.virtual("lessons", {
// // //   ref: "Lesson",
// // //   localField: "_id",
// // //   foreignField: "course",
// // // });

// // // courseSchema.virtual("enrollments", {
// // //   ref: "Enrollment",
// // //   localField: "_id",
// // //   foreignField: "course",
// // // });

// // // courseSchema.pre("save", function (next) {
// // //   if (this.isModified("title")) {
// // //     this.slug = slugify(this.title, { lower: true, strict: true });
// // //   }
// // //   next();
// // // });
// // // courseSchema.index({ title: "text", description: "text" });
// // // courseSchema.index({ category: 1, isPublished: 1 });
// // // courseSchema.index({ instructor: 1, isPublished: 1 });

// // // module.exports = mongoose.model("Course", courseSchema);

// // // Course.js
// // const mongoose = require("mongoose");
// // const slugify = require("slugify");

// // const courseSchema = new mongoose.Schema(
// //   {
// //     title: {
// //       type: String,
// //       required: true,
// //       trim: true,
// //       maxlength: 100,
// //     },
// //     slug: { type: String, unique: true },
// //     subtitle: {
// //       type: String,
// //       trim: true,
// //       maxlength: 200,
// //     },
// //     description: {
// //       type: String,
// //       required: true,
// //     },
// //     instructor: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "User",
// //       required: true,
// //     },
// //     price: {
// //       type: Number,
// //       required: true,
// //       min: 0,
// //     },
// //     image: {
// //       type: String,
// //       default: "",
// //     },
// //     category: {
// //       type: String,
// //       required: true,
// //       trim: true,
// //     },
// //     subcategory: {
// //       type: String,
// //       trim: true,
// //     },
// //     level: {
// //       type: String,
// //       enum: ["Beginner", "Intermediate", "Advanced"],
// //       default: "Beginner",
// //     },
// //     language: {
// //       type: String,
// //       default: "English",
// //     },
// //     ratings: {
// //       average: {
// //         type: Number,
// //         default: 0,
// //         min: 0,
// //         max: 5,
// //       },
// //       count: {
// //         type: Number,
// //         default: 0,
// //       },
// //     },
// //     studentsEnrolled: {
// //       type: Number,
// //       default: 0,
// //     },
// //     requirements: [
// //       {
// //         type: String,
// //         trim: true,
// //       },
// //     ],
// //     whatYoullLearn: [
// //       {
// //         type: String,
// //         trim: true,
// //       },
// //     ],
// //     totalHours: {
// //       type: Number,
// //       default: 0,
// //     },
// //     lecturesCount: {
// //       type: Number,
// //       default: 0,
// //     },

// //     status: {
// //       type: String,
// //       enum: ["draft", "published", "archived"],
// //       default: "draft",
// //     },

// //     isPublished: {
// //       type: Boolean,
// //       default: false,
// //     },
// //     publishedAt: Date,
// //   },
// //   {
// //     timestamps: true,
// //     toJSON: { virtuals: true },
// //     toObject: { virtuals: true },
// //   }
// // );

// // courseSchema.virtual("lessons", {
// //   ref: "Lesson",
// //   localField: "_id",
// //   foreignField: "course",
// // });

// // courseSchema.virtual("enrollments", {
// //   ref: "Enrollment",
// //   localField: "_id",
// //   foreignField: "course",
// // });

// // courseSchema.pre("save", async function (next) {
// //   if (this.isModified("title")) {
// //     let baseSlug = slugify(this.title, { lower: true, strict: true });
// //     let slug = baseSlug;
// //     let counter = 1;

// //     // Check for existing slugs and append suffix if needed
// //     while (
// //       await mongoose.models.Course.findOne({ slug, _id: { $ne: this._id } })
// //     ) {
// //       slug = `${baseSlug}-${counter}`;
// //       counter++;
// //     }
// //     this.slug = slug;
// //   }
// //   next();
// // });

// // courseSchema.index({ title: "text", description: "text" });
// // courseSchema.index({ category: 1, isPublished: 1 });
// // courseSchema.index({ instructor: 1, isPublished: 1 });

// // // courseSchema.pre("save", function (next) {
// // //   if (this.isModified("status")) {
// // //     this.isPublished = this.status === "published";
// // //     if (this.status === "published" && !this.publishedAt) {
// // //       this.publishedAt = new Date();
// // //     }
// // //   }

// // //   if (this.isModified("title")) {
// // //     let baseSlug = slugify(this.title, { lower: true, strict: true });
// // //     let slug = baseSlug;
// // //     let counter = 1;

// // //     // Check for existing slugs and append suffix if needed
// // //     while (
// // //       mongoose.models.Course &&
// // //       mongoose.models.Course.findOne({ slug, _id: { $ne: this._id } })
// // //     ) {
// // //       slug = `${baseSlug}-${counter}`;
// // //       counter++;
// // //     }
// // //     this.slug = slug;
// // //   }
// // //   next();
// // // });

// // // courseSchema.virtual("lessons", {
// // //   ref: "Lesson",
// // //   localField: "_id",
// // //   foreignField: "course",
// // // });

// // // courseSchema.virtual("enrollments", {
// // //   ref: "Enrollment",
// // //   localField: "_id",
// // //   foreignField: "course",
// // // });

// // // courseSchema.index({ title: "text", description: "text" });
// // // courseSchema.index({ category: 1, isPublished: 1 });
// // // courseSchema.index({ instructor: 1, isPublished: 1 });
// // // courseSchema.index({ status: 1 });

// // module.exports = mongoose.model("Course", courseSchema);

// const mongoose = require("mongoose");
// const slugify = require("slugify");

// const courseSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 100,
//     },
//     slug: { type: String, unique: true },
//     subtitle: {
//       type: String,
//       trim: true,
//       maxlength: 200,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     instructor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     price: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     image: {
//       type: String,
//       default: "",
//     },
//     category: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     subcategory: {
//       type: String,
//       trim: true,
//     },
//     level: {
//       type: String,
//       enum: ["Beginner", "Intermediate", "Advanced"],
//       default: "Beginner",
//     },
//     language: {
//       type: String,
//       default: "English",
//     },
//     ratings: {
//       average: {
//         type: Number,
//         default: 0,
//         min: 0,
//         max: 5,
//       },
//       count: {
//         type: Number,
//         default: 0,
//       },
//     },
//     studentsEnrolled: {
//       type: Number,
//       default: 0,
//     },
//     requirements: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],
//     whatYoullLearn: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],
//     totalHours: {
//       type: Number,
//       default: 0,
//     },
//     lecturesCount: {
//       type: Number,
//       default: 0,
//     },

//     status: {
//       type: String,
//       enum: ["draft", "published", "archived"],
//       default: "draft",
//     },

//     isPublished: {
//       type: Boolean,
//       default: false,
//     },
//     publishedAt: Date,
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// courseSchema.virtual("lessons", {
//   ref: "Lesson",
//   localField: "_id",
//   foreignField: "course",
// });

// courseSchema.virtual("enrollments", {
//   ref: "Enrollment",
//   localField: "_id",
//   foreignField: "course",
// });

// courseSchema.pre("save", async function (next) {
//   if (this.isModified("title")) {
//     let baseSlug = slugify(this.title, { lower: true, strict: true });
//     let slug = baseSlug;
//     let counter = 1;

//     // Check for existing slugs and append suffix if needed
//     while (
//       await mongoose.models.Course.findOne({ slug, _id: { $ne: this._id } })
//     ) {
//       slug = `${baseSlug}-${counter}`;
//       counter++;
//     }
//     this.slug = slug;
//   }
//   next();
// });

// courseSchema.index({ title: "text", description: "text" }, { language_override: "mongo_lang" }); // Fix: Use a non-existing field for language_override
// courseSchema.index({ category: 1, isPublished: 1 });
// courseSchema.index({ instructor: 1, isPublished: 1 });

// module.exports = mongoose.model("Course", courseSchema);

// models/Course.js
const mongoose = require("mongoose");
const slugify = require("slugify");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, "Subtitle cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      minlength: [50, "Description must be at least 50 characters"],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Course image is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
      default: "Beginner",
    },
    language: {
      type: String,
      default: "English",
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        set: (val) => parseFloat(val.toFixed(1)),
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    studentsEnrolled: {
      type: Number,
      default: 0,
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    whatYoullLearn: [
      {
        type: String,
        trim: true,
      },
    ],
    totalHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    lecturesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    features: [
      {
        type: String,
        trim: true,
      },
    ],
    publishedAt: Date,
    lastUpdated: Date,
  },

  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtuals
courseSchema.virtual("lessons", {
  ref: "Lesson",
  localField: "_id",
  foreignField: "course",
});

courseSchema.virtual("enrollments", {
  ref: "Enrollment",
  localField: "_id",
  foreignField: "course",
});

courseSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "course",
});

// Indexes
courseSchema.index({ title: "text", description: "text", subtitle: "text" });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ instructor: 1, status: 1 });
courseSchema.index({ status: 1, isPublished: 1 });
courseSchema.index({ slug: 1 });
courseSchema.index({ "ratings.average": -1 });
courseSchema.index({ studentsEnrolled: -1 });
courseSchema.index({ price: 1 });
courseSchema.index({ createdAt: -1 });

// Middleware
courseSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    let baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
    let slug = baseSlug;
    let counter = 1;

    // Check for existing slugs
    while (
      await mongoose.model("Course").findOne({ slug, _id: { $ne: this._id } })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }

  // Sync status with isPublished
  if (this.isModified("status")) {
    this.isPublished = this.status === "published";
    if (this.status === "published" && !this.publishedAt) {
      this.publishedAt = new Date();
    }
  } else if (this.isModified("isPublished")) {
    this.status = this.isPublished ? "published" : "draft";
  }

  // Update lastUpdated timestamp
  if (this.isModified() && !this.isModified("lastUpdated")) {
    this.lastUpdated = new Date();
  }

  next();
});

// Static methods
courseSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug }).populate(
    "instructor",
    "name avatar bio expertise"
  );
};

courseSchema.statics.findPublished = function () {
  return this.find({ status: "published", isPublished: true });
};

courseSchema.statics.findByInstructor = function (instructorId) {
  return this.find({ instructor: instructorId });
};

courseSchema.statics.findByCategory = function (category) {
  return this.find({ category, status: "published" });
};

// Instance methods
courseSchema.methods.updateRating = async function () {
  const Review = mongoose.model("Review");
  const stats = await Review.aggregate([
    { $match: { course: this._id } },
    {
      $group: {
        _id: "$course",
        averageRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    this.ratings.average = parseFloat(stats[0].averageRating.toFixed(1));
    this.ratings.count = stats[0].ratingCount;
  } else {
    this.ratings.average = 0;
    this.ratings.count = 0;
  }

  await this.save();
};

courseSchema.methods.canPublish = function () {
  const errors = [];

  if (!this.description || this.description.length < 50) {
    errors.push("Description must be at least 50 characters");
  }

  if (!this.image) {
    errors.push("Course image is required");
  }

  if (this.lecturesCount === 0) {
    errors.push("Course must have at least one lesson");
  }

  if (!this.whatYoullLearn || this.whatYoullLearn.length === 0) {
    errors.push("Learning objectives are required");
  }

  return {
    canPublish: errors.length === 0,
    errors,
  };
};

module.exports = mongoose.model("Course", courseSchema);

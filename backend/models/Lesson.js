// const mongoose = require("mongoose");

// const lessonSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 100,
//     },
//     description: {
//       type: String,
//       trim: true,
//     },
//     video: {
//       public_id: { type: String, required: true },
//       url: { type: String, required: true },
//       format: { type: String },
//       bytes: { type: Number },
//     },
//     duration: {
//       type: Number, // in seconds
//       default: 0,
//     },
//     course: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Course",
//       required: true,
//     },
//     order: {
//       type: Number,
//       required: true,
//     },
//     isPreview: {
//       type: Boolean,
//       default: false,
//     },
//     resources: [
//       {
//         title: String,
//         url: String,
//         type: String,
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// );

// lessonSchema.index({ course: 1, order: 1 }, { unique: true });

// module.exports = mongoose.model("Lesson", lessonSchema);

const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
    },
    video: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
      format: { type: String },
      bytes: { type: Number },
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    resources: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, default: 'file' },
        fileSize: { type: Number },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
)

lessonSchema.index({ course: 1, order: 1 }, { unique: true })

module.exports = mongoose.model('Lesson', lessonSchema)

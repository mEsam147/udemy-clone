// // // // const express = require("express");
// // // // const cors = require("cors");
// // // // const dotenv = require("dotenv");
// // // // const connectDB = require("./config/database");
// // // // const passport = require("passport");
// // // // const rateLimit = require("express-rate-limit");

// // // // dotenv.config();
// // // // connectDB();

// // // // // Passport config
// // // // require("./config/passport");

// // // // const app = express();

// // // // // Rate limiting
// // // // const limiter = rateLimit({
// // // //   windowMs: 15 * 60 * 1000, // 15 minutes
// // // //   max: 100, // limit each IP to 100 requests per windowMs
// // // // });
// // // // app.use(limiter);

// // // // // Middleware
// // // // app.use(cors());
// // // // app.use(express.json({ limit: "10mb" }));
// // // // app.use(express.urlencoded({ extended: true }));
// // // // app.use(passport.initialize());

// // // // // Routes
// // // // app.use("/api/auth", require("./routes/auth"));
// // // // app.use("/api/courses", require("./routes/courses"));
// // // // app.use("/api/instructors", require("./routes/instructors"));
// // // // app.use("/api/students", require("./routes/students"));
// // // // app.use("/api/upload", require("./routes/upload"));
// // // // app.use("/api/payment", require("./routes/payment"));

// // // // // Error handling middleware
// // // // app.use(require("./middlewares/errorHandler"));

// // // // // 404 handler - Fixed the path pattern
// // // // app.use("*", (req, res) => {
// // // //   res.status(404).json({ message: "Route not found" });
// // // // });

// // // // const PORT = process.env.PORT || 5000;
// // // // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// // // const express = require("express");
// // // const cors = require("cors");
// // // const dotenv = require("dotenv");
// // // const connectDB = require("./config/database");
// // // const passport = require("passport");
// // // const rateLimit = require("express-rate-limit");
// // // const cookieParser = require("cookie-parser");

// // // dotenv.config();
// // // connectDB();

// // // // Passport config
// // // require("./config/passport");

// // // const app = express();

// // // app.use(cookieParser());

// // // app.use(
// // //   cors({
// // //     origin: process.env.CLIENT_URL || "http://localhost:3000",
// // //     credentials: true, // Allow cookies to be sent
// // //     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// // //     allowedHeaders: ["Content-Type", "Authorization"],
// // //   })
// // // );

// // // // Rate limiting
// // // const limiter = rateLimit({
// // //   windowMs: 15 * 60 * 1000, // 15 minutes
// // //   max: 100, // limit each IP to 100 requests per windowMs
// // // });
// // // app.use(limiter);

// // // // Middleware

// // // app.use(express.json({ limit: "10mb" }));
// // // app.use(express.urlencoded({ extended: true }));
// // // app.use(passport.initialize());

// // // // Routes
// // // app.use("/api/auth", require("./routes/auth"));
// // // app.use("/api/courses", require("./routes/courses"));
// // // app.use("/api/instructors", require("./routes/instructors"));
// // // app.use("/api/students", require("./routes/students"));
// // // app.use("/api/upload", require("./routes/upload"));
// // // app.use("/api/payment", require("./routes/payment"));

// // // // Health check route
// // // app.get("/api/health", (req, res) => {
// // //   res.status(200).json({ message: "Server is running!" });
// // // });

// // // // Error handling middleware
// // // app.use(require("./middlewares/errorHandler"));

// // // // 404 handler - CORRECTED: Use a function instead of "*" pattern
// // // app.use((req, res, next) => {
// // //   res.status(404).json({
// // //     success: false,
// // //     message: `Route not found: ${req.originalUrl}`,
// // //   });
// // // });

// // // const PORT = process.env.PORT || 5000;
// // // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// // const express = require("express");
// // const cors = require("cors");
// // const dotenv = require("dotenv");
// // const connectDB = require("./config/database");
// // const passport = require("passport");
// // const rateLimit = require("express-rate-limit");
// // const cookieParser = require("cookie-parser");
// // const fileUpload = require("express-fileupload");
// // const helmet = require("helmet");
// // const path = require("path");
// // const { cloudinaryConfig } = require("./config/cloudinary");

// // dotenv.config();
// // connectDB();

// // // Passport config
// // require("./config/passport");

// // const app = express();

// // // ✅ MUST COME FIRST: Cookie parser
// // app.use(cookieParser());

// // app.use(helmet());
// // // app.use(
// // app.use(
// //   fileUpload({
// //     limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
// //     abortOnLimit: true,
// //     useTempFiles: true,
// //     tempFileDir: "/tmp/",
// //     debug: true,
// //     parseNested: true,
// //   })
// // );

// // // ✅ THEN CORS with proper configuration
// // app.use(
// //   cors({
// //     origin: process.env.CLIENT_URL || "http://localhost:3000",
// //     credentials: true, // Allow cookies to be sent
// //     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// //     // allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
// //   })
// // );

// // // ✅ THEN Rate limiting
// // const limiter = rateLimit({
// //   windowMs: 15 * 60 * 1000, // 15 minutes
// //   max: 200, // limit each IP to 100 requests per windowMs
// // });
// // app.use(limiter);

// // // ✅ THEN Body parsers
// // app.use(express.json({ limit: "10mb" }));
// // app.use(express.urlencoded({ extended: true }));

// // // ✅ THEN Passport
// // app.use(passport.initialize());

// // cloudinaryConfig();

// // // ✅ THEN Routes
// // app.use("/api/auth", require("./routes/auth"));
// // app.use("/api/courses", require("./routes/courses"));
// // app.use("/api/courses/seed", require("./routes/seedRoutes"));
// // app.use("/api/instructors", require("./routes/instructors"));
// // app.use("/api/students", require("./routes/students"));
// // app.use("/api/upload", require("./routes/upload"));
// // app.use("/api/payment", require("./routes/payment"));
// // app.use("/api/learn", require("./routes/learn"));
// // app.use("/api/notifications", require("./routes/notifications"));
// // app.use("/api/admin", require("./routes/admin"));
// // app.use("/api/analytics", require("./routes/analytics"));
// // app.use("/api/enrollments", require("./routes/enrollments"));

// // app.use("/api/reviews", require("./routes/reviews"));

// // app.use("/api/certificates", require("./routes/certificates"));

// // // Health check route
// // app.get("/api/health", (req, res) => {
// //   res.status(200).json({ message: "Server is running!" });
// // });

// // // Error handling middleware
// // app.use(require("./middlewares/errorHandler"));

// // // 404 handler
// // app.use((req, res, next) => {
// //   res.status(404).json({
// //     success: false,
// //     message: `Route not found: ${req.originalUrl}`,
// //   });
// // });

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// // server.js or app.js
// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const connectDB = require("./config/database");
// const passport = require("passport");
// const rateLimit = require("express-rate-limit");
// const cookieParser = require("cookie-parser");
// const helmet = require("helmet");
// const { cloudinaryConfig } = require("./config/cloudinary");

// dotenv.config();
// connectDB();

// // Passport config
// require("./config/passport");

// const app = express();

// // MUST COME FIRST: Cookie parser
// app.use(cookieParser());

// app.use(helmet());

// // THEN CORS with proper configuration
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "http://localhost:3000",
//     credentials: true, // Allow cookies to be sent
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   })
// );

// // THEN Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 250, // limit each IP to 200 requests per windowMs
// });
// app.use(limiter);

// // THEN Body parsers
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));

// // THEN Passport
// app.use(passport.initialize());

// cloudinaryConfig();

// // THEN Routes
// app.use("/api/courses/seed", require("./routes/seedRoutes"));

// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/courses", require("./routes/courses"));
// app.use("/api/instructors", require("./routes/instructors"));
// app.use("/api/students", require("./routes/students"));
// app.use("/api/upload", require("./routes/upload"));
// app.use("/api/payment", require("./routes/payment"));
// app.use("/api/learn", require("./routes/learn"));
// app.use("/api/notifications", require("./routes/notifications"));
// app.use("/api/admin", require("./routes/admin"));
// app.use("/api/analytics", require("./routes/analytics"));
// app.use("/api/enrollments", require("./routes/enrollments"));
// app.use("/api/home", require("./routes/homes"));

// app.use("/api/compare", require("./routes/compare"));

// app.use("/api/reviews", require("./routes/reviews"));

// app.use("/api/contact", require("./routes/contact"));

// app.use("/api/certificates", require("./routes/certificates"));

// // Health check route
// app.get("/api/health", (req, res) => {
//   res.status(200).json({ message: "Server is running!" });
// });

// // Error handling middleware
// app.use(require("./middlewares/errorHandler"));

// // 404 handler
// app.use((req, res, next) => {
//   res.status(404).json({
//     success: false,
//     message: `Route not found: ${req.originalUrl}`,
//   });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// server.js or app.js - ADD THIS LINE
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/database')
const passport = require('passport')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const { cloudinaryConfig } = require('./config/cloudinary')

dotenv.config()
connectDB()

// Passport config
require('./config/passport')

const app = express()

// MUST COME FIRST: Cookie parser
app.use(cookieParser())

app.use(helmet())

// THEN CORS with proper configuration
app.use(
  cors({
    origin: "https://udemy-clone-sigma.vercel.app"||process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
)

// THEN Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 250, // limit each IP to 200 requests per windowMs
})
app.use(limiter)

// THEN Body parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// THEN Passport
app.use(passport.initialize())

cloudinaryConfig()

// THEN Routes
app.use('/api/courses/seed', require('./routes/seedRoutes'))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/courses', require('./routes/courses'))
app.use('/api/instructors', require('./routes/instructors'))
app.use('/api/students', require('./routes/students'))
app.use('/api/upload', require('./routes/upload'))
app.use('/api/payment', require('./routes/payment'))
app.use('/api/learn', require('./routes/learn'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/analytics', require('./routes/analytics'))
app.use('/api/enrollments', require('./routes/enrollments'))
app.use('/api/home', require('./routes/homes'))

// ✅ ADD THIS LINE - Compare Routes
app.use('/api/compare', require('./routes/compare')) // ← ADD THIS LINE

app.use('/api/reviews', require('./routes/reviews'))
app.use('/api/contact', require('./routes/contact'))
app.use('/api/certificates', require('./routes/certificates'))
app.use('/api/search', require('./routes/search'))

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' })
})

// Error handling middleware
app.use(require('./middlewares/errorHandler'))

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

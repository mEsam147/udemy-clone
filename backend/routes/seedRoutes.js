const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");
const Certificate = require("../models/Certificate");
const Notification = require("../models/Notification");
const Review = require("../models/Review");
const { faker } = require("@faker-js/faker");

faker.seed(123); // For reproducible fake data

const seedDatabase = async (req, res) => {
  try {
    console.log("Starting seeding process...");

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Enrollment.deleteMany({});
    await Certificate.deleteMany({});
    await Notification.deleteMany({});
    await Review.deleteMany({});
    console.log("Existing data cleared");

    // Helper function to generate fake URL
    const generateFakeUrl = (type = "image") => {
      const base = "https://res.cloudinary.com/demo";
      const version = faker.number.int({ min: 1000000000, max: 2000000000 });
      const word = faker.lorem.word();
      if (type === "image")
        return `${base}/image/upload/v${version}/${word}.jpg`;
      if (type === "video")
        return `${base}/video/upload/v${version}/${word}.mp4`;
      if (type === "certificate")
        return `${base}/image/upload/v${version}/certificate_${word}.pdf`;
      return base;
    };

    // Valid ISO 639-1 language codes (supported by MongoDB text search)
    const validLanguages = [
      "da",
      "nl",
      "en",
      "fi",
      "fr",
      "de",
      "hu",
      "it",
      "nb",
      "pt",
      "ro",
      "ru",
      "es",
      "sv",
      "tr",
    ];

    // Generate 20 Students
    const students = [];
    const studentCredentials = [];
    for (let i = 1; i <= 20; i++) {
      const fakeUser = {
        name: faker.person.fullName(),
        email: `student${i}@example.com`,
        password: "password123",
        role: "student",
        avatar: generateFakeUrl("image"),
        bio: faker.lorem.sentence(),
        recentSearches: [faker.lorem.word(), faker.lorem.word()],
        isVerified: faker.datatype.boolean(),
        wishlist: [],
      };
      students.push(fakeUser);
      studentCredentials.push({
        email: fakeUser.email,
        password: "password123",
        role: "student",
      });
    }

    // Generate 5 Instructors
    const instructors = [];
    const instructorCredentials = [];
    for (let i = 1; i <= 5; i++) {
      const fakeUser = {
        name: faker.person.fullName(),
        email: `instructor${i}@example.com`,
        password: "password123",
        role: "instructor",
        avatar: generateFakeUrl("image"),
        bio: faker.lorem.paragraph(),
        expertise: [faker.lorem.word(), faker.lorem.word()],
        instructorApplication: {
          status: "approved",
          submittedAt: faker.date.past(),
        },
        instructorProfile: {
          availability: faker.helpers.arrayElement([
            "within-1-hour",
            "within-24-hours",
            "within-48-hours",
            "within-1-week",
          ]),
          responseTime: `Typically responds within ${faker.lorem.word()} hours`,
          officeHours: `${faker.date.weekday()}, 9AM-5PM`,
          contactEmail: `instructor${i}@example.com`,
        },
      };
      instructors.push(fakeUser);
      instructorCredentials.push({
        email: fakeUser.email,
        password: "password123",
        role: "instructor",
      });
    }

    // Generate 2 Admins
    const admins = [];
    const adminCredentials = [];
    for (let i = 1; i <= 2; i++) {
      const fakeUser = {
        name: `Admin ${faker.person.lastName()}`,
        email: `admin${i}@example.com`,
        password: "password123",
        role: "admin",
        avatar: generateFakeUrl("image"),
        bio: "Platform administrator",
      };
      admins.push(fakeUser);
      adminCredentials.push({
        email: fakeUser.email,
        password: "password123",
        role: "admin",
      });
    }

    // Create all users
    const allUsersData = [...students, ...instructors, ...admins];
    const createdUsers = await User.insertMany(allUsersData);
    console.log(`Created ${createdUsers.length} users`);

    const createdStudents = createdUsers.slice(0, 20);
    const createdInstructors = createdUsers.slice(20, 25);
    const createdAdmins = createdUsers.slice(25);

    // Generate 30 Courses (6 per instructor)
    const courses = [];
    for (let instrIdx = 0; instrIdx < createdInstructors.length; instrIdx++) {
      for (let courseIdx = 1; courseIdx <= 6; courseIdx++) {
        const title = `${faker.lorem.words(3)} ${faker.lorem.word()} Course`;
        const fakeCourse = {
          title,
          subtitle: faker.lorem.sentence({ min: 5, max: 10 }),
          description: faker.lorem.paragraphs(3),
          instructor: createdInstructors[instrIdx]._id,
          price: parseFloat(faker.commerce.price({ min: 0, max: 200 })),
          image: generateFakeUrl("image"),
          category: faker.lorem.word(),
          subcategory: faker.lorem.word(),
          level: faker.helpers.arrayElement([
            "Beginner",
            "Intermediate",
            "Advanced",
          ]),
          language: faker.helpers.arrayElement(validLanguages),
          ratings: {
            average: parseFloat((Math.random() * 5).toFixed(1)),
            count: faker.number.int({ min: 0, max: 100 }),
          },
          studentsEnrolled: faker.number.int({ min: 5, max: 50 }),
          requirements: Array.from(
            { length: faker.number.int({ min: 2, max: 5 }) },
            () => faker.lorem.sentence()
          ),
          whatYoullLearn: Array.from(
            { length: faker.number.int({ min: 3, max: 7 }) },
            () => faker.lorem.sentence()
          ),
          totalHours: faker.number.int({ min: 5, max: 50 }),
          lecturesCount: faker.number.int({ min: 5, max: 20 }),
          status: "published",
          isPublished: true,
          publishedAt: faker.date.past(),
        };
        courses.push(fakeCourse);
      }
    }

    // Insert courses individually to catch specific errors
    const createdCourses = [];
    for (const course of courses) {
      try {
        const newCourse = await new Course(course).save();
        createdCourses.push(newCourse);
      } catch (err) {
        console.warn(
          `Failed to create course "${course.title}" (language: ${course.language}): ${err.message}`
        );
      }
    }
    console.log(`Created ${createdCourses.length} courses`);

    // Stop if no courses were created
    if (createdCourses.length === 0) {
      throw new Error("No courses created, cannot proceed with seeding");
    }

    // Generate Lessons (5-10 per course)
    const lessons = [];
    for (const course of createdCourses) {
      const numLessons = faker.number.int({ min: 5, max: 10 });
      for (let lessonIdx = 1; lessonIdx <= numLessons; lessonIdx++) {
        const fakeLesson = {
          title: `${faker.lorem.words(4)} Lesson`,
          description: faker.lorem.paragraph(),
          video: {
            public_id: `lesson_${course._id}_${lessonIdx}`,
            url: generateFakeUrl("video"),
            format: "mp4",
            bytes: faker.number.int({ min: 1000000, max: 50000000 }),
          },
          duration: faker.number.int({ min: 300, max: 1800 }),
          course: course._id,
          order: lessonIdx,
          isPreview: lessonIdx === 1,
          resources: Array.from(
            { length: faker.number.int({ min: 0, max: 3 }) },
            () => ({
              title: faker.lorem.sentence(),
              url: generateFakeUrl("image"),
              type: faker.lorem.word(),
            })
          ),
        };
        lessons.push(fakeLesson);
      }
    }

    const createdLessons = await Lesson.insertMany(lessons, { ordered: false });
    console.log(`Created ${createdLessons.length} lessons`);

    // Generate Enrollments
    const enrollments = [];
    for (const student of createdStudents) {
      const numEnrollments = faker.number.int({ min: 3, max: 7 });
      const availableCourses = faker.helpers
        .shuffle(createdCourses)
        .slice(0, numEnrollments);
      for (const course of availableCourses) {
        const courseLessons = createdLessons.filter(
          (l) => l.course.toString() === course._id.toString()
        );
        const numCompleted = faker.number.int({
          min: 0,
          max: courseLessons.length,
        });
        const completedLessons = courseLessons
          .slice(0, numCompleted)
          .map((l) => l._id);
        const progress =
          courseLessons.length > 0
            ? Math.round((numCompleted / courseLessons.length) * 100)
            : 0;

        const fakeEnrollment = {
          student: student._id,
          course: course._id,
          completedLessons,
          progress,
          enrolledAt: faker.date.past({ years: 1 }),
          lastAccessed: faker.date.recent(),
          rating:
            Math.random() > 0.7
              ? {
                  score: faker.number.int({ min: 1, max: 5 }),
                  review: faker.lorem.paragraph(),
                  ratedAt: faker.date.past(),
                }
              : undefined,
        };
        enrollments.push(fakeEnrollment);
      }
    }

    const createdEnrollments = await Enrollment.insertMany(enrollments, {
      ordered: false,
    });
    console.log(`Created ${createdEnrollments.length} enrollments`);

    // Generate Certificates individually with enrollment reference
    const certificates = [];
    const fullProgressEnrollments = createdEnrollments.filter(
      (e) => e.progress === 100
    );
    for (const enrollment of fullProgressEnrollments.slice(0, 20)) {
      const course = createdCourses.find(
        (c) => c._id.toString() === enrollment.course.toString()
      );
      if (!course) {
        console.warn(`Course not found for enrollment ${enrollment._id}`);
        continue;
      }
      const fakeCert = {
        student: enrollment.student,
        course: enrollment.course,
        enrollment: enrollment._id, // Add enrollment reference
        issueDate: faker.date.past(),
        certificateUrl: generateFakeUrl("certificate"),
        verificationCode: `CERT-${
          course.slug || course.title.substring(0, 4).toUpperCase()
        }-${faker.string.uuid().substring(0, 8)}`,
        approved: true,
      };
      certificates.push(fakeCert);
    }

    const createdCertificates = [];
    for (const cert of certificates) {
      try {
        const newCert = await new Certificate(cert).save();
        createdCertificates.push(newCert);
      } catch (err) {
        console.warn(
          `Failed to create certificate for student ${cert.student} course ${cert.course}: ${err.message}`
        );
      }
    }
    console.log(`Created ${createdCertificates.length} certificates`);

    // Generate Notifications
    const notifications = [];
    for (const user of createdUsers) {
      const numNotifs = faker.number.int({ min: 5, max: 10 });
      const types = [
        "ENROLLMENT",
        "LESSON_COMPLETED",
        "WISHLIST_ADDED",
        "REVIEW_ADDED",
        "PAYMENT_SUCCESS",
        "COURSE_UPDATED",
      ];
      for (let i = 0; i < numNotifs; i++) {
        const fakeNotif = {
          user: user._id,
          type: faker.helpers.arrayElement(types),
          message: `${faker.lorem.sentence()} for ${faker.lorem.word()} course.`,
          course:
            Math.random() > 0.5
              ? faker.helpers.arrayElement(createdCourses)._id
              : null,
          read: faker.datatype.boolean(),
          createdAt: faker.date.past({ months: 6 }),
        };
        notifications.push(fakeNotif);
      }
    }

    const createdNotifications = await Notification.insertMany(notifications, {
      ordered: false,
    });
    console.log(`Created ${createdNotifications.length} notifications`);

    // Generate Reviews
    const reviews = [];
    for (const enrollment of createdEnrollments.slice(0, 50)) {
      const numReviews = faker.number.int({ min: 1, max: 3 });
      for (let i = 0; i < numReviews; i++) {
        const fakeReview = {
          user: enrollment.student,
          course: enrollment.course,
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.paragraph(),
          createdAt: faker.date.past(),
        };
        reviews.push(fakeReview);
      }
    }

    const createdReviews = await Review.insertMany(reviews, { ordered: false });
    console.log(`Created ${createdReviews.length} reviews`);

    // Add wishlist items for students
    for (const student of createdStudents) {
      const numWishlist = faker.number.int({ min: 1, max: 5 });
      const wishlistItems = faker.helpers
        .arrayElements(createdCourses, numWishlist)
        .map((c) => c._id);
      await User.findByIdAndUpdate(student._id, { wishlist: wishlistItems });
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
      sampleCredentials: [
        ...studentCredentials.slice(0, 5),
        ...instructorCredentials,
        ...adminCredentials,
      ],
    };

    res.status(200).json({
      success: true,
      message: "Database seeded with big data successfully",
      summary,
    });

    console.log("Seeding completed!");
  } catch (error) {
    console.error("Seeding error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error seeding database",
        error: error.message,
      });
  }
};

module.exports = seedDatabase;

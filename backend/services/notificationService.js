const Notification = require("../models/Notification");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const sendNotification = async ({
  userId,
  type,
  message,
  courseId,
  email,
  pushToken,
}) => {
  try {
    // Save in-app notification
    const notification = await Notification.create({
      user: userId,
      type,
      message,
      course: courseId || null,
    });

    // Send email notification (if applicable)
    if (email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Notification: ${type}`,
        text: message,
      });
    }

    // Send push notification (if pushToken exists)
    if (pushToken) {
      // Placeholder for push notification logic (e.g., Firebase Cloud Messaging)
      console.log(`Push notification to ${pushToken}: ${message}`);
    }

    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

module.exports = { sendNotification };

// const nodemailer = require("nodemailer");

// // Create transporter
// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Send password reset email
// exports.sendPasswordResetEmail = async (email, resetToken) => {
//   const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Password Reset Request - Udemy Clone",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #333;">Password Reset Request</h2>
//         <p>You requested to reset your password. Click the button below to proceed:</p>

//         <div style="text-align: center; margin: 30px 0;">
//           <a href="${resetUrl}"
//              style="background-color: #6c5ce7; color: white; padding: 12px 24px;
//                     text-decoration: none; border-radius: 5px; display: inline-block;">
//             Reset Password
//           </a>
//         </div>

//         <p>Or copy and paste this link in your browser:</p>
//         <p style="word-break: break-all; color: #6c5ce7;">${resetUrl}</p>

//         <p>This link will expire in 1 hour for security reasons.</p>

//         <p>If you didn't request this password reset, please ignore this email.</p>

//         <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
//         <p style="color: #666; font-size: 12px;">
//           This is an automated message from Udemy Clone. Please do not reply to this email.
//         </p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("Password reset email sent to:", email);
//     return true;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw new Error("Failed to send password reset email");
//   }
// };

// // Send password changed confirmation
// exports.sendPasswordChangedEmail = async (email) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Password Changed Successfully - Udemy Clone",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #333;">Password Changed Successfully</h2>
//         <p>Your password has been changed successfully.</p>

//         <p>If you did not make this change, please contact our support team immediately.</p>

//         <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
//         <p style="color: #666; font-size: 12px;">
//           This is an automated message from Udemy Clone. Please do not reply to this email.
//         </p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("Password changed email sent to:", email);
//   } catch (error) {
//     console.error("Error sending confirmation email:", error);
//   }
// };

// module.exports = exports;

// services/emailService.js
const nodemailer = require("nodemailer");

// Create transporter (using your existing configuration)
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error) => {
  if (error) {
    console.error("Email transporter error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Send password reset email (your existing function)
exports.sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request - Learnly",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #6c5ce7; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #6c5ce7;">${resetUrl}</p>
        
        <p>This link will expire in 1 hour for security reasons.</p>
        
        <p>If you didn't request this password reset, please ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message from Learnly. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send password reset email");
  }
};

// Send password changed confirmation (your existing function)
exports.sendPasswordChangedEmail = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Changed Successfully - Learnly",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Changed Successfully</h2>
        <p>Your password has been changed successfully.</p>
        
        <p>If you did not make this change, please contact our support team immediately.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message from Learnly. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password changed email sent to:", email);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
};

// NEW: Send contact form emails
exports.sendContactEmail = async ({
  name,
  email,
  subject,
  message,
  contactId,
}) => {
  const adminEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;

  // Email to admin
  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: `New Contact Form: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">New Contact Message</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Contact ID: ${contactId}</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2d3748; margin-top: 0;">Message Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #4a5568; font-weight: bold; width: 100px;">Name:</td>
                <td style="padding: 8px 0; color: #2d3748;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #4a5568; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0; color: #2d3748;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #4a5568; font-weight: bold;">Subject:</td>
                <td style="padding: 8px 0; color: #2d3748;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #4a5568; font-weight: bold; vertical-align: top;">Message:</td>
                <td style="padding: 8px 0; color: #2d3748; white-space: pre-line;">${message}</td>
              </tr>
            </table>
          </div>
          <div style="text-align: center; color: #718096; font-size: 14px;">
            <p>This message was sent from the contact form on your website.</p>
            <p>Received: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    `,
  };

  // Email to user (confirmation)
  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Thank you for contacting Learnly!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Thank You, ${name}!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">We've received your message</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #2d3748; margin: 0 0 15px 0;">Hello <strong>${name}</strong>,</p>
            <p style="color: #4a5568; margin: 0 0 15px 0;">Thank you for reaching out to us! We have received your message and our team will review it shortly.</p>
            
            <div style="background: #edf2f7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; color: #2d3748;"><strong>Your Message:</strong></p>
              <p style="margin: 0; color: #4a5568; white-space: pre-line; font-style: italic;">"${message}"</p>
            </div>

            <p style="color: #4a5568; margin: 20px 0 0 0;">
              <strong>What happens next?</strong><br>
              • We'll respond within 24 hours<br>
              • Check your email for our reply<br>
              • For urgent matters, call us at +1 (555) 123-4567
            </p>
          </div>
          
          <div style="text-align: center; color: #718096; font-size: 14px;">
            <p>This is an automated confirmation. Please do not reply to this email.</p>
            <p>Reference: ${contactId} • ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);
    console.log("Contact emails sent successfully for:", email);
    return true;
  } catch (error) {
    console.error("Error sending contact emails:", error);
    throw new Error("Failed to send contact emails");
  }
};

// NEW: Send course enrollment confirmation
exports.sendEnrollmentConfirmation = async (
  studentEmail,
  courseTitle,
  studentName
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: `Enrollment Confirmation - ${courseTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to ${courseTitle}!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You're successfully enrolled</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #2d3748; margin: 0 0 15px 0;">Hello <strong>${studentName}</strong>,</p>
            <p style="color: #4a5568; margin: 0 0 15px 0;">
              Congratulations! You have successfully enrolled in <strong>${courseTitle}</strong>. 
              We're excited to have you join this learning journey.
            </p>
            
            <div style="background: #e6fffa; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #38b2ac;">
              <p style="margin: 0; color: #2d3748;"><strong>Next Steps:</strong></p>
              <ul style="margin: 10px 0 0 0; color: #4a5568;">
                <li>Access your course anytime from your dashboard</li>
                <li>Start with the first lesson to begin learning</li>
                <li>Download any available resources</li>
                <li>Join course discussions to connect with others</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.CLIENT_URL}/courses" 
                 style="background-color: #6c5ce7; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;
                        font-weight: bold;">
                Start Learning Now
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #718096; font-size: 14px;">
            <p>Happy learning!<br>The Learnly Team</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Enrollment confirmation sent to:", studentEmail);
  } catch (error) {
    console.error("Error sending enrollment confirmation:", error);
  }
};

module.exports = exports;

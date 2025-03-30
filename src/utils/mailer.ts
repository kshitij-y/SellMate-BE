import nodemailer from "nodemailer";

export const sendEmail = async ({
  to,
  subject,
  url, // Only passing URL now
}: {
  to: string;
  subject: string;
  url: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // ✅ HTML Template inside mailer.ts
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
    <h2 style="color: #4CAF50;">SellMate - Email Verification</h2>
    <p style="font-size: 16px; color: #555;">Hi,</p>
    <p style="font-size: 14px; color: #555;">Please verify your email by clicking the button below:</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${url}" style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 4px;">Verify Email</a>
    </div>
    <p style="font-size: 14px; color: #999;">If you didn't request this, you can safely ignore this email.</p>
    <hr style="border: 0; border-top: 1px solid #eee;">
    <footer style="text-align: center; font-size: 12px; color: #999;">
      © ${new Date().getFullYear()} SellMate. All rights reserved.
    </footer>
  </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent to ${to}`);
};

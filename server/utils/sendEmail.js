const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'SLIIT Got Talent'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
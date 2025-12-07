// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// ENV values
const PORT = process.env.PORT || 4000;
const API_KEY = process.env.CONTACT_API_KEY;
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;

if (!API_KEY || !MAIL_USER || !MAIL_PASS) {
  console.error('❌ Please set CONTACT_API_KEY, MAIL_USER, MAIL_PASS in .env');
  process.exit(1);
}

// CORS allow – dev main tumhara frontend localhost:5173 par chal raha hai
app.use(
  cors({
    origin: [
      'http://localhost:5173',                     // dev ke liye
      'https://melodic-tapioca-fbbff4.netlify.app', // Netlify URL
      'https://paviontechnologies.com',            // tumhara domain
    ],
  })
);

// JSON body parse
app.use(express.json());

// Test route (optional)
app.get('/', (req, res) => {
  res.send('Contact backend is running ✅');
});

// MAIN CONTACT ROUTE
app.post('/api/contact', async (req, res) => {
  // Pass-key / API-key check
  const clientKey = req.headers['x-api-key'];

  if (!clientKey || clientKey !== API_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    // Nodemailer transporter (Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS, // Gmail App Password
      },
    });

    const mailOptions = {
      from: `"Pavion Website" <${MAIL_USER}>`,
      to: 'paviontechnologies@gmail.com', // jahan tum email chahte ho
      replyTo: email,
      subject: `New message from ${name} - ${subject}`,
      text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `,
      html: `
        <h2>New message from Pavion Technologies website</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log('✅ Email sent from', email);
    return res.json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    console.error('❌ Mail error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Contact server running on http://localhost:${PORT}`);
});

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");
const { sendTelegramNotification } = require("./telegram");
const app = express();
require("dotenv").config();

// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "https://eyuel.eyuniya.dev"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
);

// Middleware to parse JSON
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  host: "mail.eyuniya.dev",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.PASSWORD,
  },
});

// Proxy endpoint for downloading the PDF
app.get("/api/download-cv", async (req, res) => {
  try {
    const response = await axios.get(
      "https://fine.sweaven.dev/Eyuel-Solomon-CV.pdf",
      {
        responseType: "stream",
      },
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=Eyuel-Solomon-CV.pdf",
    });

    response.data.pipe(res);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send("Error downloading file");
  }
});

app.post("/api/send-message", async (req, res) => {
  try {
    const { name, email, company, interests, message } = req.body;

    if (!name || !email || !interests || !message) {
      return res
        .status(400)
        .json({ error: "Name, email, interests, and message are required" });
    }

    // 1. Send confirmation to the visitor
    const confirmationMail = {
      from: process.env.EMAIL_USER || "21fineguy@gmail.com",
      to: email,
      subject: "Thanks for reaching out!",
      html: `
       <h2>Thank you for contacting me, ${name}!</h2>
        <p>I've received your message and will get back to you within 24-48 hours.</p>
        <p>Here's what you submitted:</p>
        <ul>
          <li><strong>Interests:</strong> ${interests.join(", ")}</li>
          <li><strong>Message:</strong> ${message}</li>
        </ul>
        <p>Best regards,<br/>Eyuel</p>
        <p><small>This is an automated message. Please don't reply directly to this email.</small></p>
      `,
    };

    // Send both emails and Telegram notification
    await Promise.all([
      transporter.sendMail(confirmationMail),
      sendTelegramNotification({ name, email, company, interests, message }),
    ]);

    res.status(200).json({
      success: true,
      message: "Thank you! Your message has been sent.",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to send message",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

const PORT = process.env.PORT || 3001 ;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

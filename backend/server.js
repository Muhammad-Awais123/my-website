const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const messageRoutes = require("./routes/messageRoutes");
const Message = require("./models/messageModel");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

// ✅ Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ API Route (Messages)
app.use("/api/messages", messageRoutes);

// ✅ Contact Form API
app.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    await Message.create({ name, email, subject, message });

    // ✅ Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: `New Contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
    });

    // ✅ Send WhatsApp Notification
    await axios.get(
      `https://api.callmebot.com/whatsapp.php?phone=${process.env.WHATSAPP_NUMBER}&text=New+Contact:+${name}+(${email})+-+${subject}+${message}&apikey=${process.env.WHATSAPP_KEY}`
    );

    res.status(200).json({ message: "✅ Message processed successfully" });
  } catch (err) {
    console.error("❌ Error in /contact:", err);
    res.status(500).json({ message: "❌ Failed to process message" });
  }
});

// ✅ Serve Portfolio Website (Main Static Pages)
app.use(express.static(path.join(__dirname, ".."))); // index.html, assets

// ✅ Main Pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.get("/portfolio-details", (req, res) => {
  res.sendFile(path.join(__dirname, "../portfolio-details.html"));
});

app.get("/service-details", (req, res) => {
  res.sendFile(path.join(__dirname, "../service-details.html"));
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);

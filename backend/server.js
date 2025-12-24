require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require("node-cron");

const app = express();

// ---------- ROUTES ----------
const authRoutes = require("./src/routes/auth");
const diaryRoutes = require("./src/routes/diaryRoutes");
const reminderRoutes = require("./src/routes/reminders");
const professionalDiaryRoutes = require("./src/routes/ProfessionalDiary");
const personalRoutes = require("./src/routes/personal");
const scheduleRoutes = require("./src/routes/schedule");

// ---------- MIDDLEWARE ----------
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(express.json());

// ---------- HEALTH ----------
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// ---------- API ROUTES ----------
app.use("/api/auth", authRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/professional-diary", professionalDiaryRoutes);
app.use("/api/personal", personalRoutes);
app.use("/api/schedule", scheduleRoutes); 

// ---------- DB ----------
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mydiaryDB";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

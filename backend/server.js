// backend/server.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require("node-cron");

// ---------- ROUTES ----------
const authRoutes = require("./src/routes/auth");
const diaryRoutes = require("./src/routes/diaryRoutes");
const reminderRoutes = require("./src/routes/reminders");
const professionalDiaryRoutes = require("./src/routes/ProfessionalDiary");

// ---------- MODELS (for cron) ----------
const User = require("./src/models/User");
const Diary = require("./src/models/Diary");
const Reminder = require("./src/models/Reminder");

// ---------- APP ----------
const app = express();

// ---------- MIDDLEWARE ----------
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(express.json());

// ---------- HEALTH CHECK ----------
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// ---------- API ROUTES ----------
app.use("/api/auth", authRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/professional-diary", professionalDiaryRoutes);
app.use("/api/personal", require("./src/routes/personal"));
app.use("/api/schedule", require("./src/routes/schedule"));


// ---------- CONFIG ----------
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mydiaryDB";
const CRON_ENABLED = process.env.CRON_ENABLED !== "false";

console.log(`Connecting to MongoDB: ${MONGODB_URI}`);

// ---------- DB + SERVER ----------
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

    // ---------- CRON JOB (Daily Reminder) ----------
    if (CRON_ENABLED) {
      cron.schedule("5 0 * * *", async () => {
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);

          const users = await User.find({});

          for (const u of users) {
            const hasTodayDiary = await Diary.exists({
              userId: u._id,
              createdAt: { $gte: today, $lt: tomorrow },
            });

            if (!hasTodayDiary) {
              const reminderExists = await Reminder.exists({
                userId: u._id,
                date: today,
              });

              if (!reminderExists) {
                await Reminder.create({
                  userId: u._id,
                  date: today,
                  message: "You didn't write your diary today.",
                });
              }
            }
          }

          console.log("Daily reminder cron completed");
        } catch (err) {
          console.error("Cron error:", err.message);
        }
      });

      console.log("Cron scheduled at 00:05 daily");
    }
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");

require("./src/config/passport");

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(passport.initialize());

/* ---------- ROUTES ---------- */
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/reminders", require("./src/routes/reminders"));
app.use("/api/quotes", require("./src/routes/quotes"));
app.use("/api/personal", require("./src/routes/personal"));
app.use("/api/diary", require("./src/routes/diary"));
app.use("/api/professional-diary", require("./src/routes/ProfessionalDiary"));
app.use("/api/schedule", require("./src/routes/schedule"));

/* ---------- HEALTH CHECK (OPTIONAL BUT GOOD) ---------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", time: new Date() });
});

/* ---------- DATABASE ---------- */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(5000, () => {
      console.log("🚀 Server running at http://localhost:5000");
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

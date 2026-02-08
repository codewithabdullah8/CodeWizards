const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");

const router = express.Router();

/* ===============================
   HELPERS
================================*/
const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

/* ===============================
   GOOGLE AUTH
================================*/
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(`http://localhost:3000/oauth-success?token=${token}`);
  }
);

/* ===============================
   CURRENT USER
================================*/
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash");

    res.json(user);
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

/* ===============================
   SIGNUP (GMAIL ONLY)
================================*/
router.post("/signup", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    email = email.toLowerCase().trim();

    if (!GMAIL_REGEX.test(email))
      return res.status(400).json({ message: "Only Gmail accounts allowed" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password too short" });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash: hash,
      provider: "local",
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   LOGIN (GMAIL ONLY)
================================*/
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.toLowerCase().trim();

    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    if (!GMAIL_REGEX.test(email))
      return res.status(400).json({ message: "Only Gmail accounts allowed" });

    const user = await User.findOne({ email });

    if (!user || user.provider === "google")
      return res.status(400).json({ message: "Use Google login" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");

const router = express.Router();

/* ===============================
   GOOGLE ROUTES
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
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(`http://localhost:3000/oauth-success?token=${token}`);
  }
);

/* ===============================
   GET CURRENT USER  ✅ STEP 8 FIX
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
   SIGNUP (LOCAL)
================================*/
router.post("/signup", async (req, res) => {
  try {
    let { name, email, password } = req.body;
    email = email.toLowerCase().trim();

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash: hash,
      provider: "local",
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({ 
      token, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   LOGIN (LOCAL)
================================*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.passwordHash)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!(await bcrypt.compare(password, user.passwordHash)))
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({ 
      token, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

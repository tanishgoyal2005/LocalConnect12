const argon2 = require("argon2");
const UserColRef = require("../models/ModelUser");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require('dotenv').config();

// Temporary in-memory storage for OTP codes
const otpStore = new Map();

// Email format regex helper
function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}
console.log("Email:", process.env.EMAIL_USER);
console.log("Pass:", process.env.EMAIL_PASS ? "Loaded (hidden)" : "Missing");

// 🔐 Nodemailer Transporter Configuration
// Note: Ensure EMAIL_USER and EMAIL_PASS are correctly set in your .env file
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// Verify transporter on startup to catch auth errors immediately
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Transporter Error:", error);
  } else {
    console.log("✅ Mail server is ready to send messages!");
  }
});

// 1. SIGNUP FUNCTION
async function doSignup(req, resp) {
  try {
    console.log(req.body);
    const { emailid, password, utype } = req.body;
    if (!emailid || !password || !utype) {
      return resp.json({ status: false, msg: "All fields are required!" });
    }
    const cleanEmail = emailid.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return resp.json({ status: false, msg: "Please provide a valid email address!" });
    }
    if (password.length < 6) {
      return resp.json({ status: false, msg: "Password must be at least 6 characters long!" });
    }
    const allowedRoles = ["Citizen", "Vendor", "Admin"];
    if (!allowedRoles.includes(utype)) {
      return resp.json({ 
        status: false, 
        msg: "Invalid user type! Allowed types: Citizen, Vendor, Admin." 
      });
    }
    const existingUser = await UserColRef.findOne({ emailid: cleanEmail });
    if (existingUser) {
      return resp.json({ status: false, msg: "This email is already registered. Please login!" });
    }
    const hashedPassword = await argon2.hash(password);
    const newUser = new UserColRef({
      ...req.body,
      emailid: cleanEmail,
      password: hashedPassword,
      utype: utype,
      status: true,
    });
    await newUser.save();
    return resp.json({ 
      status: true, 
      msg: "Signup Successful! Your account has been registered with Evenue." 
    });
  } catch (error) {
    console.error("Signup error:", error);
    return resp.status(500).json({ status: false, msg: error.message || "Error saving user!" });
  }
}

async function doLogin(req, resp)
 {
  try {
    const { emailid, password } = req.body;
    if (!emailid || !password) {
      return resp.json({ status: false, msg: "Email and password are required!" });
    }
    const cleanEmail = emailid.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return resp.json({ status: false, msg: "Invalid email format!" });
    }
    const secretKey = process.env.SEC_KEY || "evenue_secret_key";
    // -------------------------------------------------------------
    // 👑 STEP 1: MASTER ADMIN LOGIN (admin@evenue.com / admin123)
    // -------------------------------------------------------------
    if (cleanEmail === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
      const token = jwt.sign(
        { emailid: cleanEmail, utype: "Admin" },
        secretKey,
        { expiresIn: "2h" }
      );
      return resp.json({
        status: true,
        msg: "Master Admin Login Successful!",
        utype: "Admin",
        emailid: cleanEmail,
        token: token,
      });
    }
    // -------------------------------------------------------------
    // 🔍 STEP 2: DATABASE ME USER / ADMIN DHUNDO
    // -------------------------------------------------------------
    const user = await UserColRef.findOne({ emailid: cleanEmail });
    if (!user) {
      return resp.json({ status: false, msg: "Invalid Email ID or Password!" });
    }
    // 🚨 STEP 3: CHECK IF USER IS BLOCKED
    if (user.status === false) {
      return resp.json({
        status: false,
        isBlocked: true,
        msg: "You are blocked! Please contact the administrator.",
      });
    }
    // 🔑 STEP 4: VERIFY PASSWORD (argon2 / plain text)
    let isMatch = false;
    try {
      isMatch = await argon2.verify(user.password, password);
    } catch (e) {
      isMatch = user.password === password;
    }
    if (!isMatch) {
      return resp.json({ status: false, msg: "Invalid Password! Please try again." });
    }
    // 🟢 STEP 5: LOGIN SUCCESSFUL (Generate Token & Return Role)
    const token = jwt.sign(
      { emailid: user.emailid, utype: user.utype },
      secretKey,
      { expiresIn: "2h" }
    );
    return resp.json({
      status: true,
      msg: "Login Successful!",
      utype: user.utype, // 'Admin', 'Citizen', ya 'Vendor'
      emailid: user.emailid,
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return resp.status(500).json({ status: false, msg: "Server error during login!" });
  }
}
// 3. CHECK EMAIL AVAILABILITY
async function doCheckEmail(req, resp) {
  try {
    const { emailid } = req.body;
    if (!emailid) {
      return resp.status(400).json({ exists: false, msg: "Email is required" });
    }
    const cleanEmail = emailid.trim().toLowerCase();
    const user = await UserColRef.findOne({ emailid: cleanEmail });
    if (user) {
      return resp.json({ exists: true, msg: "This Email is already registered!" });
    } else {
      return resp.json({ exists: false, msg: "Email is available" });
    }
  } catch (error) {
    console.error("Check Email Error:", error);
    return resp.status(500).json({ exists: false, msg: "Server error while checking email" });
  }
}

// 4. FORGOT PASSWORD - GENERATE & SEND OTP TO ANY REGISTERED EMAIL
async function doForgotPassword(req, resp) {
  try {
    const { emailid } = req.body;
    if (!emailid) {
      return resp.json({ status: false, msg: "Email address is required!" });
    }
    const cleanEmail = emailid.trim().toLowerCase();
    
    // Check if user exists in DB
    const user = await UserColRef.findOne({ emailid: cleanEmail });
    if (!user) {
      return resp.json({ status: false, msg: "No account found with this email address!" });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 10 minutes expiration
    otpStore.set(cleanEmail, {
      otp: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Email Options
    const mailOptions = {
      from: `"Evenue Support" <${process.env.EMAIL_USER}>`, // Sender is your authenticated Gmail
      to: cleanEmail, // Receiver is the user who requested password reset
      subject: 'Password Reset OTP - Evenue',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f5; border-radius: 10px;">
          <h2 style="color: #064e3b;">Evenue Password Reset</h2>
          <p>You requested a password reset for your account.</p>
          <p>Your 6-digit verification code is:</p>
          <h1 style="color: #064e3b; letter-spacing: 4px; background: #e6f4ea; padding: 10px; display: inline-block; border-radius: 6px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return resp.json({ status: true, msg: `OTP sent successfully to ${cleanEmail}!` });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return resp.status(500).json({ status: false, msg: "Failed to send OTP email. Please check server configuration." });
  }
}

// 5. RESET PASSWORD - VERIFY OTP & UPDATE PASSWORD
async function doResetPassword(req, resp) {
  try {
    const { emailid, otp, newPassword } = req.body;
    if (!emailid || !otp || !newPassword) {
      return resp.json({ status: false, msg: "All fields are required!" });
    }
    if (newPassword.length < 6) {
      return resp.json({ status: false, msg: "New password must be at least 6 characters long!" });
    }

    const cleanEmail = emailid.trim().toLowerCase();
    const storedData = otpStore.get(cleanEmail);

    if (!storedData) {
      return resp.json({ status: false, msg: "OTP request not found or expired. Please request a new code." });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(cleanEmail);
      return resp.json({ status: false, msg: "OTP has expired. Please request a new one." });
    }

    if (storedData.otp !== otp.trim()) {
      return resp.json({ status: false, msg: "Invalid OTP code entered!" });
    }

    // Hash new password using Argon2
    const hashedNewPassword = await argon2.hash(newPassword);

    // Update user password in DB
    await UserColRef.findOneAndUpdate(
      { emailid: cleanEmail },
      { password: hashedNewPassword }
    );

    // Clear OTP from memory
    otpStore.delete(cleanEmail);

    return resp.json({ status: true, msg: "Password successfully reset! You can now log in." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return resp.status(500).json({ status: false, msg: "Server error while resetting password!" });
  }
}

module.exports = { doSignup, doLogin, doCheckEmail, doForgotPassword, doResetPassword };
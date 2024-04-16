const express = require("express");
const User = require("../model/userSchema");
const {
  jsonAuthMiddleware,
  generateToken,
  generateResetToken,
} = require("../authorization/auth");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/signup", async (req, res) => {
  try {
    const userData = req.body;
    const data = User(userData);
    const savedUser = await data.save();
    // const token = generateToken(savedUser);
    res.status(200).json({
      data: savedUser,
      msg: "User Registered Successfully",
      token: token,
    });
  } catch (error) {
    console.error("Error on saving data", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.status(200).json({ data: { user: user, token: token } });
  } catch (error) {
    console.error("Error on login", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate password reset token (you may want to use a library like 'jsonwebtoken' or 'crypto' for this)
    const resetToken = generateResetToken();

    // Save the token to the user document (assuming you have a 'resetToken' field in your schema)
    user.resetToken = resetToken;
    await user.save();

    // Example using Nodemailer:
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
      tls: {
        rejectUnauthorized: false, // Ignore TLS verification
      },
    });
    const mailOptions = {
      from: "yash.dicecoder105@gmail.com",
      to: user.email,
      subject: "Password Reset Token",
      text: `Your password reset token is: ${resetToken}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Error sending email" });
      } else {
        console.log("Email sent: " + info.response);
        res
          .status(200)
          .json({ msg: "Password reset token sent to your email" });
      }
    });

    res.status(200).json({ msg: "Password reset token sent to your email" });
  } catch (error) {
    console.error("Error on forgot password", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.resetToken !== resetToken) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Update user's password and remove/reset the resetToken
    user.password = newPassword;
    user.resetToken = undefined;
    await user.save();

    res.status(200).json({ msg: "Password reset successfully" });
  } catch (error) {
    console.error("Error on reset password", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

module.exports = router;

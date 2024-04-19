const express = require("express");
const User = require("../model/userSchema");
const axios = require("axios");
const {
  jsonAuthMiddleware,
  generateToken,
  generateResetToken,
} = require("../authorization/auth");
const router = express.Router();
const nodemailer = require("nodemailer");

// Import validation schemas
const {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validate/user-validation");

// Middleware to validate request body against schema
function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body); // Validate request body against schema
      next();
    } catch (error) {
      const errorMessage = error?.issues[0]?.message;
      console.log("errorMessage:", errorMessage);
      res.status(400).json({ error: errorMessage, status: false });
    }
  };
}

router.post("/signup", validate(signupSchema), async (req, res) => {
  try {
    const userData = req.body;
    const data = User(userData);
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists", status: false });
    }
    const savedUser = await data.save();
    console.log("USer Registererd Successfull");
    res
      .status(200)
      .json({ message: "User Registered Successfully", status: true });
  } catch (error) {
    console.error("Error on saving data", error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
});

router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ error: "Invalid email or password", status: false });
    }

    const token = generateToken(user);

    res.status(200).json({ token: token, status: true });
  } catch (error) {
    console.error("Error on login", error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
});

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email });

      if (!user) {
        return res.status(404).json({ error: "User not found", status: false });
      }

      const resetToken = generateResetToken();
      user.resetToken = resetToken;
      await user.save();

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
          res.status(500).json({ error: "Error sending email", status: false });
        } else {
          console.log("Email sent: " + info.response);
          res.status(200).json({
            message: "Password reset token sent to your email",
            status: true,
          });
        }
      });
    } catch (error) {
      console.error("Error on forgot password", error);
      res.status(500).json({ error: "Internal Server Error", status: false });
    }
  }
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  async (req, res) => {
    try {
      const { email, resetToken, newPassword } = req.body;

      const user = await User.findOne({ email: email });

      if (!user) {
        return res.status(404).json({ error: "User not found", status: false });
      }

      if (user.resetToken !== resetToken) {
        return res
          .status(400)
          .json({ error: "Invalid or expired reset token", status: false });
      }

      user.password = newPassword;
      user.resetToken = undefined;
      await user.save();

      res
        .status(200)
        .json({ message: "Password reset successfully", status: true });
    } catch (error) {
      console.error("Error on reset password", error);
      res.status(500).json({ error: "Internal Server Error", status: false });
    }
  }
);
//For getting User

router.get("/profile", jsonAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userData._id;
    // console.log(req.user);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

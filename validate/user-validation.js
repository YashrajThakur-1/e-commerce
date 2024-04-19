const { z } = require("zod");

// Define schemas for request body validation
const signupSchema = z.object({
  // Define the structure and validation rules for signup request body
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must be at most 50 characters long" }),
  email: z
    .string({ required_error: "email is required" })
    .trim()
    .email({ message: "Invalid email format" }),
  password: z
    .string({ required_error: "password is required" })
    .trim()
    .min(6, { message: "Password must be at least 6 characters long" }),
  phoneNo: z
    .string({
      required_error: "phoneNo is required",
      message: "Phone number is required",
    })
    .trim(),
});

const loginSchema = z.object({
  // Define the structure and validation rules for login request body
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

const forgotPasswordSchema = z.object({
  // Define the structure and validation rules for forgot password request body
  email: z.string().email({ message: "Invalid email format" }),
});

const resetPasswordSchema = z.object({
  // Define the structure and validation rules for reset password request body
  email: z.string().email({ message: "Invalid email format" }),
  resetToken: z.string(),
  newPassword: z
    .string()
    .min(6, { message: "New password must be at least 6 characters long" }),
});

module.exports = {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};

import mongoose from "mongoose";
import Users from "../models/userModel.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

// Register controller
// request, response, next
export const register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  // Validate fields
  if (!(firstName || lastName || email || password)) {
    next("Please fill required field!");
    return;
  }

  try {
    const userExist = await Users.findOne({ email });
    if (userExist) {
      next("Email address already exists");
      return
    }
    const hashedPassword = await hashString(password);

    const user = await Users.create({
      firstName,
      lastName,
      email,
      password: hashedPassword
    })

    // Send email verification to user
    sendVerificationEmail(user, res);

  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
}

// Login controller 
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    //Validation
    if (!email || !password) {
      next("Please provide user credentials!");
      return;
    }

    // Find user by email
    const user = await Users.findOne({ email })
      .select("+password")
      .populate({
        path: "friends",
        select: "firstName lastName location profileUrl -password",
      });

    if (!user) {
      // next("Invalid email or password");
      return res.status(404).json({ message: "Invalid email or password" });
    }

    //Kiểm tra email đã được xác minh chưa
    if (!user?.verified) {
      next("User email is not verified. Check your email and verify your email!");
      return;
    }

    // Compare password
    const isMatch = await compareString(password, user?.password);

    if (!isMatch) {
      next("Invalid email or password!");
      return;
    }

    // Loại bỏ trường password khỏi user trước khi gửi nó trong phản hồi đến phía client
    user.password = undefined;
    const token = createJWT(user?._id);
    res.status(201).json({
      success: true,
      message: "Login successfully!",
      user,
      token
    });

  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
}
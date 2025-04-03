import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    summaryUrl: [
      {
        type: String,
      },
    ]
  },
  { timestamps: true }
);

// Hash password before saving the user document.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare entered password with stored hashed password.
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT access token.
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id.toString(),
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Generate JWT refresh token.
userSchema.methods.generateRefreshToken = function (expiry) {
  const tokenExpiry = expiry || process.env.REFRESH_TOKEN_EXPIRY;
  return jwt.sign(
    { id: this._id.toString() },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: tokenExpiry,
    }
  );
};

export const User = mongoose.model("User", userSchema);

import { ApiError, ApiResponse, asyncHandler } from "../utils/lib.js";
import { User } from "../models/user.model.js";
import { COOKIE_OPTIONS } from "../lib/constants.js";
import { generateAccessAndRefreshTokens } from "../lib/token.js";
import jwt from "jsonwebtoken";

// USER AUTHENTICATION & MANAGEMENT
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        throw new ApiError(422, "All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const user = await User.create({ fullName, email, password });
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
        .status(201)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        .json(new ApiResponse(201, { user, accessToken, refreshToken }, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(422, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.isPasswordMatched(password))) {
        throw new ApiError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        .json(new ApiResponse(200, { user, accessToken, refreshToken }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: "" } });
    return res
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .status(200)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User data fetched successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(422, "Both old and new passwords are required");
    }

    const user = await User.findById(req.user?.id);
    if (!(await user.isPasswordMatched(oldPassword))) {
        throw new ApiError(401, "Incorrect password");
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

export { registerUser, loginUser, logoutUser, getCurrentUser, changePassword };

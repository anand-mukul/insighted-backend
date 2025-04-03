import { Admin } from "../models/admin.model.js";
import { ApiError } from "./utils.js";

const generateAccessAndRefreshTokens = async (adminId, remember = false) => {
  try {
    const admin = await Admin.findById(adminId);
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken(
      remember ? process.env.REFRESH_TOKEN_REMEMBER_EXPIRY : undefined
    );
    
    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

export { generateAccessAndRefreshTokens };s
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/lib.js";


const generateAccessAndRefreshTokens = async (userId, remember = false) => {
  try {
    const user = await User.findById(userId);
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

export { generateAccessAndRefreshTokens };
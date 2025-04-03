import { Router } from "express";
import rateLimit from "express-rate-limit";
import { summaryController } from "../controllers/summary.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
});

router.use(apiLimiter);

router.route("/generate-summary").post(verifyJWT, summaryController);

export default router;

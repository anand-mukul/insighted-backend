import cors from "cors";
import summaryRoutes from "./routes/summary.route.js";
import userRoutes from "./routes/user.route.js";
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import "dotenv/config";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public", { maxAge: 31557600000 }));
app.use(cookieParser());

app.use((req, res, next) => {
  req.setTimeout(300000);
  res.setTimeout(300000);
  next();
});

app.options("*", cors());
app.use("/api/v1", summaryRoutes);
app.use("/api/v1/user", userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default app;

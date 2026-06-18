const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// ----------------------
// Middlewares
// ----------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ----------------------
// CORS CONFIG (PRODUCTION SAFE)
// ----------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://ai-interview-saas-sigma.vercel.app",
];

// ✅ FIX: safer CORS handling (no crash on bad origin)
app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server / postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("Blocked CORS Origin:", origin);
        return callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ----------------------
// HEALTH CHECK
// ----------------------
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 AI Interview SaaS Backend is Running Successfully",
  });
});

app.get("/health", (req, res) => {
  res.send("OK");
});

// ----------------------
// ROUTES
// ----------------------
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

// ----------------------
// 404 HANDLER
// ----------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

module.exports = app;

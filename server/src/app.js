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
// CORS CONFIG (IMPORTANT for deploy)
// ----------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      // 👉 production frontend URL yaha add karna baad me
    ],
    credentials: true,
  }),
);

// ----------------------
// HEALTH CHECK ROUTE
// ----------------------
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 AI Interview SaaS Backend is Running Successfully",
  });
});

// optional health route
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

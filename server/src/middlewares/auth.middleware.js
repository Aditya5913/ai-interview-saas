const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
  try {
    // ----------------------------
    // 1. Get token from header OR cookies
    // ----------------------------
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies.token;

    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return res.status(401).json({
        message: "Token not provided.",
      });
    }

    // ----------------------------
    // 2. Check blacklist
    // ----------------------------
    const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token });

    if (isTokenBlacklisted) {
      return res.status(401).json({
        message: "Token is blacklisted / invalid",
      });
    }

    // ----------------------------
    // 3. Verify token
    // ----------------------------
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token.",
      error: err.message,
    });
  }
}

module.exports = { authUser };

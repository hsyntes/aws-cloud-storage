const ErrorProvider = require("../classes/ErrorProvider");
const User = require("../models/User");
const jsonwebtoken = require("jsonwebtoken");

// * Sending & saving the token
const sendToken = (res, status, user, message) => {
  const token = jsonwebtoken.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie("jsonwebtoken", token, {
    httpOnly: true,
    // secure: true,
    // sameSite: "none",
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
  });

  res.status(status).json({
    status: "success",
    message,
    data: {
      user,
    },
  });
};

// * Register new user
exports.signup = async (req, res, next) => {
  try {
    const user = await User.create({
      username: req.body.username,
    });

    if (!user) return next(new ErrorProvider(404, "fail", "User not found."));

    sendToken(res, 201, user, "You've signed up successfully.");
  } catch (e) {
    next(e);
  }
};

// * Login existing user
exports.login = async (req, res, next) => {
  try {
    if (!req.body.username)
      return next(
        new ErrorProvider(403, "fail", "Please type a username to login.")
      );

    const { username } = req.body;

    const user = await User.findOne({ username });

    sendToken(res, 200, user, "Welcome back!");
  } catch (e) {
    next(e);
  }
};

exports.verifyToken = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    )
      token = req.headers.authorization.split("Bearer").at(1).trim();

    if (!token)
      return next(
        new ErrorProvider(401, "fail", "You're not logged in. Pleae log in.")
      );

    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return next(
        new ErrorProvider(
          401,
          "fail",
          "Authorization failed. Please try to log in again."
        )
      );

    req.user = user;

    next();
  } catch (e) {
    next(e);
  }
};

const { JsonWebTokenError, TokenExpiredError } = require("jsonwebtoken");
const ErrorProvider = require("../classes/ErrorProvider");

// ! 409: Duplicate Error
const uniqueError = (err) => {
  if (err.keyPattern.hasOwnProperty("username"))
    return new ErrorProvider(409, "fail", "That user is already exists.");

  return new ErrorProvider(409, "fail", err.message);
};

// ! 403: Forbidden
const validationError = (err) => {
  const messages = err.messages.split(",");

  const message = messages
    .map((message, index) => message.split(":").at(index === 0 ? 2 : 1))
    .join("")
    .trim();

  return new ErrorProvider(403, "fail", err.message);
};

const jsonWebTokenError = () =>
  new ErrorProvider(401, "fail", "Authentication failed.");

const tokenExpiredError = () =>
  new ErrorProvider(401, "fail", "Authentication expired.");

module.exports = async (err, req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    if (err.code === 11000) err = uniqueError(err);
    if (err.name === "ValidationError") err = validationError(err);
    if (err instanceof JsonWebTokenError) err = jsonWebTokenError();
    if (err instanceof TokenExpiredError) err = tokenExpiredError();
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.status).json({
    status: err.status,
    message: err.message,
  });

  next();
};

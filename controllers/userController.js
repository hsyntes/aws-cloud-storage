const ErrorProvider = require("../classes/ErrorProvider");
const User = require("../models/User");

exports.uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file)
      next(new ErrorProvider(404, "fail", "Not found photo to upload."));
  } catch (e) {
    next(e);
  }
};

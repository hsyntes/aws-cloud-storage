const ErrorProvider = require("../classes/ErrorProvider");
const Post = require("../models/Post");

// * Uplaod a post
exports.uploadPost = async (req, res, next) => {
  try {
    if (!req.files)
      return next(
        new ErrorProvider(403, "fail", "Please add photos to upload.")
      );

    const { files } = req;

    for (const file of files) {
      const params = {
        Bucket: process.env.AWS_BUCKET,
        ACL: process.env.AWS_ACL,
        Key: `posts/`,
      };
    }
  } catch (e) {}
};

// * Getting a post
exports.getPost = async (req, res, next) => {
  try {
  } catch (e) {
    next(e);
  }
};

// * Deleting a post
exports.deletePost = async (req, res, next) => {
  try {
  } catch (e) {
    next(e);
  }
};

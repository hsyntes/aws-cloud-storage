const sharp = require("sharp");
const ErrorProvider = require("../classes/ErrorProvider");
const User = require("../models/User");
const AWS = require("../aws-config");

// * Uploading photo
exports.uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file)
      next(new ErrorProvider(404, "fail", "Not found photo to upload."));

    // * Creating a user
    const user = await User.create({
      username: req.body.username,
    });

    // * Resizing user's photo
    const photo = await sharp(req.file.buffer)
      .resize({
        width: "320px",
        height: "320px",
        fit: "cover",
      })
      .toFormat("png")
      .png({ quality: 75 })
      .toBuffer();

    // * AWS Parameters
    const params = {
      Bucket: process.env.AWS_Bucket,
      ACL: process.env.AWS_ACL,
      Key: `users/${user.username}`,
      Body: photo,
    };

    const s3 = new AWS.S3();
    try {
      s3.upload(params, async (err, data) => {
        if (err)
          return next(
            new ErrorProvider(500, "fail", `Error uploading the photo: ${err}`)
          );

        const url = data.Location;

        user.photo = url;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
          status: "success",
          message: "Profile photo has been updated successfully.",
          data: {
            url,
          },
        });
      });
    } catch (e) {
      next(e);
    }
  } catch (e) {
    next(e);
  }
};

// * Deleting the photo
exports.deletePhoto = async (req, res, next) => {
  try {
    if (!req.params.username)
      return next(
        new ErrorProvider(403, "fail", "Please specify a user to delete photo.")
      );

    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) return next(new ErrorProvider(404, "fail", "User not found."));

    const params = {
      Bucket: process.env.AWS_Bucket,
      Key: `users/${user.username}.png`,
    };

    const s3 = new AWS.S3();
    try {
      s3.deleteObject(params, async (err, data) => {
        if (err)
          return next(
            new ErrorProvider(500, "fail", `Error deleting the photo: ${err}`)
          );

        user.photo = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(204).json({
          status: "success",
          message: "Profile photo has been deleted successfully.",
          data: null,
        });
      });
    } catch (e) {
      next(e);
    }

    // * Alternative: More efficient approach
    try {
      // * Check if the object exists before attempting to delete it.
      await s3.headObject().promise();
    } catch (e) {
      if (e.code === "NotFound")
        return next(
          new ErrorProvider(404, "fail", "Couldn't photo to delete.")
        );

      // * If there's an error other than NotFound, handle it and return an error response
      return next(e);
    }

    try {
      await s3.deleteObject(params).promise();
    } catch (e) {
      next(e);
    }

    user.photo = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "Your profile picture has been removed successfully.",
      data: null,
    });
  } catch (e) {
    next(e);
  }
};

// * Downloading files
exports.getPhoto = async (req, res, next) => {
  try {
    if (!req.params.username)
      return next(
        new ErrorProvider(403, "fail", "Please specify a user to get photo.")
      );

    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user)
      return next(
        new ErrorProvider(404, "fail", "Not found user to get photo.")
      );

    const params = {
      Bucket: process.env.AWS_Bucket,
      Key: `users/${user.username}.png`,
    };

    const s3 = new AWS.S3();
    try {
      s3.getObject(params, (err, data) => {
        if (err)
          return next(new ErrorProvider(404, "fail", `Not found photo.`));

        const photo = data.Body.toString();

        res.status(200).json({
          status: "success",
          data: {
            photo,
          },
        });
      });
    } catch (e) {
      next(e);
    }
  } catch (e) {
    next(e);
  }
};

const sharp = require("sharp");
const ErrorProvider = require("../classes/ErrorProvider");
const User = require("../models/User");
const AWS = require("../aws-config");

// * Uploading photo
exports.uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file)
      next(new ErrorProvider(404, "fail", "Not found photo to upload."));

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
      Key: `users/${req.user.username}`,
      Body: photo,
    };

    // * Call the S3 module from AWS
    const s3 = new AWS.S3();
    try {
      s3.upload(params, async (err, data) => {
        if (err)
          return next(
            new ErrorProvider(500, "fail", `Error uploading the photo: ${err}`)
          );

        const url = data.Location;

        req.user.photo = url;
        await req.user.save({ validateBeforeSave: false });

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

    // * Alternative
    try {
      await s3.upload(params).promise();
    } catch (e) {
      next(e);
    }
  } catch (e) {
    next(e);
  }
};

// * Deleting the photo
exports.removePhoto = async (req, res, next) => {
  try {
    if (!req.params.username)
      return next(
        new ErrorProvider(403, "fail", "Please specify a user to delete photo.")
      );

    const params = {
      Bucket: process.env.AWS_Bucket,
      Key: `users/${req.user.username}.png`,
    };

    // * Call the S3 module from AWS
    const s3 = new AWS.S3();
    try {
      s3.deleteObject(params, async (err, data) => {
        if (err)
          return next(
            new ErrorProvider(500, "fail", `Error deleting the photo: ${err}`)
          );

        // * Removing the photo from the MongoDB
        req.user.photo = undefined;
        await req.user.save({ validateBeforeSave: false });

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

    // * Removing the photo from the MongoDB
    req.user.photo = undefined;
    await req.user.save({ validateBeforeSave: false });

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

    const params = {
      Bucket: process.env.AWS_Bucket,
      Key: `users/${req.user.username}.png`,
    };

    // * Call the S3 module from AWS
    const s3 = new AWS.S3();
    try {
      s3.getObject(params, (err, data) => {
        if (err)
          return next(new ErrorProvider(404, "fail", `Not found photo.`));

        // * Getting photo URL Object
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

// * Deleting multiple files
exports.closeAccount = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `users/${user.username}.png`,
    };

    s3.deleteObject(params, (err) => {
      if (err)
        return next(
          new ErrorProvider(422, "fail", "Error deleting your profile picture.")
        );
    });

    await Post.deleteMany({ postedBy: user._id });

    const folderParams = {
      Bucket: process.env.AWS_BUCKET,
      Prefix: `posts/${user.username}`,
    };

    const objects = await s3.listObjectsV2(folderParams).promise();

    if (objects?.Contents.length !== 0) {
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET,
        Delete: {
          Objects: objects.Contents.map((object) => ({ Key: object.Key })),
        },
      };

      s3.deleteObjects(deleteParams, (err) => {
        if (err)
          return next(
            new ErrorProvider(403, "fail", "Couldn't delete user's posts.")
          );
      });
    }

    res.status(204).json({
      status: "success",
      message: "Your accunt has been deleted successfully.",
      data: null,
    });
  } catch (e) {
    next(e);
  }
};

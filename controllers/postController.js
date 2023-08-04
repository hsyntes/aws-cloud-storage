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
        Bucket: process.env.AWS_Bucket,
        Key: `users/${req.user.username}/${file.originalname}`,
        Body: file.buffer,
      };

      try {
        const data = await s3.upload(params).promise();

        const url = data.Location;

        const post = await Post.create({
          postedBy: req.user._id,
        });
      } catch (err) {
        console.error("Error uploading:", err);
        // Handle error as needed
      }
    }
  } catch (e) {
    next(e);
  }
};

// * Getting a post
exports.getPost = async (req, res, next) => {
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

// * Deleting a post
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post)
      return next(new ErrorProvider(404, "fail", "Not found post to delete."));

    if (!post.postedBy.equals(req.user._id))
      return next(
        new ErrorProvider(403, "fail", "You cannot delete someone else's post.")
      );

    // * AWS Paremeters
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `posts/${req.user.username}/${post.photo
        .split("/")
        .at(-1)
        .replaceAll("%", ":")
        .replaceAll("3A", "")}`,
    };

    // * Deleting post's photo from AWS Cloud
    const s3 = new AWS.S3();
    s3.deleteObject(params, async (err) => {
      if (err)
        return next(
          new ErrorProvider(422, "fail", "Couldn't delete your post.")
        );

      await Comment.deleteMany({ commentedPost: post._id });
      await Post.findByIdAndDelete(post._id);

      res.status(204).json({
        stauts: "success",
        message: "Your post has been deleted succesfully.",
        data: null,
      });
    });
  } catch (e) {
    next(e);
  }
};

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { versionKey: false }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;

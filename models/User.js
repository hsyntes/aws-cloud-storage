const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "@username is required."],
      minlength: [3, "@username cannot be shorter than 3 characters."],
      maxlength: [12, "@username connot be longer than 12 characters."],
      trim: true,
    },

    photo: String,
  },
  { versionKey: false }
);

userSchema.virtual("posts", {
  ref: "Post",
  foreignField: "postedBy",
  localField: "_id",
});

const User = mongoose.model("User", userSchema);

module.exports = User;

const express = require("express");
const multer = require("multer");

const {
  getPost,
  uploadPost,
  deletePost,
} = require("../controllers/postController");

const router = express.Router();
const storage = multer({ storage: multer.memoryStorage() });

router.get("/", getPost);
// * Uploading multiple photos for a post
router.post("/upload", storage.array("photo", 10), uploadPost);
router.delete("/delete", deletePost);

module.exports = router;

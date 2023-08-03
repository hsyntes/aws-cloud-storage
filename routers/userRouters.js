const express = require("express");
const multer = require("multer");

const {
  uploadPhoto,
  deletePhoto,
  getPhoto,
} = require("../controllers/userController");

const router = express.Router();
const storage = multer({ storage: multer.memoryStorage() });

router.get("/", getPhoto);
router.post("/upload", storage.single("photo"), uploadPhoto);
router.delete("/delete/:username", deletePhoto);

module.exports = router;

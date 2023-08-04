const express = require("express");
const multer = require("multer");

const {
  uploadPhoto,
  removePhoto,
  getPhoto,
} = require("../controllers/userController");

const { verifyToken, signup, login } = require("../controllers/authController");

const router = express.Router();
const storage = multer({ storage: multer.memoryStorage() });

router.post("/signup", signup);
router.post("/login", login);

// * Protect after this
router.use(verifyToken);

router.get("/", getPhoto);
router.post("/upload", storage.single("photo"), uploadPhoto);
router.delete("/delete/:username", removePhoto);
router.delete("/delete");

module.exports = router;

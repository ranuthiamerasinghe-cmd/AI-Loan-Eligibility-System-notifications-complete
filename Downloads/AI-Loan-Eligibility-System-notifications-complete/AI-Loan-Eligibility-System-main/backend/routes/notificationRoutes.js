const express = require("express");
const { getMyNotifications } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", protect, getMyNotifications);

module.exports = router;

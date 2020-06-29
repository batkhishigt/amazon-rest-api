const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");
const {
  createComment,
  updateComment,
  getComment,
  deleteComment,
  getComments,
} = require("../controller/comments");

router
  .route("/")
  .get(getComments)
  .post(protect, authorize("admin", "operator", "user"), createComment);
router
  .route("/:id")
  .get(getComment)
  .delete(protect, authorize("admin", "operator", "user"), deleteComment)
  .put(protect, authorize("admin", "operator", "user"), updateComment);
module.exports = router;

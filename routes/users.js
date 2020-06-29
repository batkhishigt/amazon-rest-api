const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  createUser,
  getUser,
  getUsers,
  deleteUsers,
  updateUsers,
  forgotPassword,
  resetPassword,
} = require("../controller/users");

const { getUsersBooks } = require("../controller/book");
const { getUserComments } = require("../controller/comments");
const router = express.Router();
//const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/protect");
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/register").post(registerUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router
  .route("/")
  .get(protect, getUsers)
  .post(protect, authorize("admin", "operator"), createUser);

router.route("/:id/books").get(protect, authorize("operator"), getUsersBooks);
router
  .route("/:id")
  .get(protect, authorize("admin", "operator"), getUser)
  .delete(protect, authorize("admin", "operator"), deleteUsers)
  .put(protect, authorize("admin", "operator"), updateUsers);
// router.route("/:id/photo").put(uploadBookPhoto);
router.route("/:id/comments").get(getUserComments);
module.exports = router;

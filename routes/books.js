const express = require("express");
const { protect, authorize } = require("../middleware/protect");
const {
  getBooks,
  getBook,
  createBook,
  deleteBook,
  updateBook,
  uploadBookPhoto,
} = require("../controller/book");
const router = express.Router();
//const router = express.Router({ mergeParams: true });
const { getBookComments } = require("../controller/comments");
router
  .route("/")
  .get(getBooks)
  .post(protect, authorize("admin", "operator"), createBook);
router
  .route("/:id")
  .get(getBook)
  .delete(protect, authorize("admin", "operator"), deleteBook)
  .put(protect, authorize("admin", "operator"), updateBook);

router
  .route("/:id/photo")
  .put(protect, authorize("admin", "operator"), uploadBookPhoto);
router.route("/:id/book").get(getBookComments);
module.exports = router;

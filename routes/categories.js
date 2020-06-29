const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");
const {
  getCategory,
  getCategories,
  createCategories,
  deleteCategories,
  updateCategories,
  uploadCategoryPhoto,
} = require("../controller/categories");

const { getCategoryBooks } = require("../controller/book");
router.route("/:categoryId/books").get(getCategoryBooks);

// const bookRouter = require("./books");
// router.use("/:categoryId/books", bookRouter);

router
  .route("/")
  .get(getCategories)
  .post(protect, authorize("admin"), createCategories);
router
  .route("/:id")
  .get(getCategory)
  .delete(protect, authorize("admin"), deleteCategories)
  .put(protect, authorize("admin", "operator"), updateCategories);
router.route("/:id/photo").put(protect, uploadCategoryPhoto);

module.exports = router;

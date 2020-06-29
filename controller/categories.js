const Category = require("../models/category");
const MyError = require("../utils/myError");
const asyncHandler = require("../middleware/asyncHandler");
const path = require("path");
const paginate = require("../utils/paginate");
exports.getCategories = asyncHandler(async (req, res, next) => {
  const select = req.query.select;
  const sort = req.query.sort;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;

  ["select", "sort", "page", "limit"].forEach((el) => {
    delete req.query[el];
  });
  const pagination = await paginate(Category, limit, page);
  const categories = await Category.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  res.json({ success: true, data: categories, pagination: pagination });
});

exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).populate("books");
  if (!category) {
    throw new MyError(req.params.id + "ID-тэй категори байхгүй", 400);
  }
  res.json({ success: true, data: category });
});

exports.createCategories = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);
  res.status(200).json({ success: true, data: category });
});

exports.deleteCategories = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    throw new MyError(req.params.id + "ID-тэй категори байхгүй", 400);
  }
  category.remove();
  res.json({ success: true, data: category });
});

exports.updateCategories = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    throw new MyError(req.params.id + "ID-тэй категори байхгүй", 400);
  }
  res.json({ success: true, data: category });
});
exports.uploadCategoryPhoto = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new MyError(req.params.id + "ID-тэй ка байхгүй", 400);
  }
  // photo upload
  const file = req.files.file;
  if (!file.mimetype.startsWith("image")) {
    throw new MyError("Та зураг аплоад хийнэ үү", 400);
  }
  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    throw new MyError("Таны зурагны хэмжээ 100KB-таас их байна", 400);
  }
  file.name = "photo_" + req.params.id + path.parse(file.name).ext;
  file.mv(process.env.FILE_UPLOAD_PATH + "/" + file.name, (err) => {
    if (err) {
      throw new MyError(req.params.id + "ID-тэй категори байхгүй", 400);
    }
    category.photo = file.name;
    category.save();
    res.status(200).json({ success: true, data: file.name });
  });

  // res.json({ success: true, data: book });
});

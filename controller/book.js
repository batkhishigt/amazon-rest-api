const Book = require("../models/book");
const Category = require("../models/category");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const path = require("path");
const paginate = require("../utils/paginate");
exports.getBooks = asyncHandler(async (req, res, next) => {
  const select = req.query.select;
  const sort = req.query.sort;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  ["select", "sort", "page", "limit"].forEach((el) => {
    delete req.query[el];
  });
  const pagination = await paginate(Book, limit, page);

  const books = await Book.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit)
    .populate({
      path: "category",
      select: "name averagePrice",
    });
  res.json({ success: true, data: books, pagination: pagination });
});
exports.getUsersBooks = asyncHandler(async (req, res, next) => {
  const select = req.query.select;
  const sort = req.query.sort;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  ["select", "sort", "page", "limit"].forEach((el) => {
    delete req.query[el];
  });
  const pagination = await paginate(Book, limit, page);
  req.query.createUser = req.userId;
  const books = await Book.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit)
    .populate({
      path: "category",
      select: "name averagePrice",
    });
  res.json({
    success: true,
    count: books.length,
    data: books,
    pagination: pagination,
  });
});
exports.getCategoryBooks = asyncHandler(async (req, res, next) => {
  const select = req.query.select;
  const sort = req.query.sort;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  ["select", "sort", "page", "limit"].forEach((el) => {
    delete req.query[el];
  });
  const pagination = await paginate(Book, limit, page);

  const books = await Book.find(
    { ...req.query, category: req.params.categoryId },
    select
  )
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.json({
    success: true,
    count: books.length,
    data: books,
    pagination: pagination,
  });
});

exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    throw new MyError(req.params.id + "ID-тэй ном байхгүй", 400);
  }
  res.json({ success: true, data: book });
});

exports.createBook = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    throw new MyError(req.body.category + "ID-тэй категори байхгүй", 400);
  }
  req.body.createUser = req.userId;
  const book = await Book.create(req.body);
  res.status(200).json({ success: true, data: book });
});

exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) {
    throw new MyError(req.params.id + "ID-тэй ном байхгүй", 400);
  }
  if (book.createUser.toString() !== req.userId && req.UserRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л устгах эрхтэй", 403);
  }
  book.remove();
  res.json({ success: true, data: book });
});

exports.updateBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    throw new MyError(req.params.id + "ID-тэй ном байхгүй", 400);
  }
  if (book.createUser.toString() !== req.userId && req.UserRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }
  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    book[attr] = req.body[attr];
  }
  book.save();
  // book = await Book.findByIdAndUpdate(req.params.id, req.body, {
  //   new: true,
  //   runValidators: true,
  // });

  res.json({ success: true, data: book });
});
//PUT  api/v1/books/:id/photo
exports.uploadBookPhoto = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    throw new MyError(req.params.id + "ID-тэй ном байхгүй", 400);
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
      throw new MyError("Файлыг хуулах явцад алдаа гараа" + err.message, 400);
    }
    book.photo = file.name;
    book.save();
    res.status(200).json({ success: true, data: file.name });
  });

  // res.json({ success: true, data: book });
});

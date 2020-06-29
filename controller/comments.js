const Category = require("../models/category");
const MyError = require("../utils/myError");
const asyncHandler = require("../middleware/asyncHandler");
const path = require("path");
const paginate = require("../utils/paginateSequelize");

exports.getComments = asyncHandler(async (req, res, next) => {
  let select = req.query.select;
  const sort = req.query.sort;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;

  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => {
    delete req.query[el];
  });
  const pagination = await paginate(req.db.comment, limit, page);

  let query = { limit: limit, offset: pagination };
  query.limit = limit;
  query.offset = pagination.start - 1;
  if (req.query) {
    query.where = req.query;
  }
  if (select) {
    query.attributes = select;
  }
  if (sort) {
    query.order = sort
      .split(" ")
      .map((el) => [
        el.charAt(0) === "-" ? el.substring(1) : el,
        el.charAt(0) === "-" ? "DESC" : "ASC",
      ]);
  }
  const comments = await req.db.comment.findAll(query);

  res.json({
    success: true,
    data: comments,
    pagination: pagination,
  });
});

exports.createComment = asyncHandler(async (req, res, next) => {
  const comment = await req.db.comment.create(req.body);
  res.status(200).json({ success: true, data: comment });
});
exports.getComment = asyncHandler(async (req, res, next) => {
  const comment = await req.db.comment.findByPk(req.params.id);
  if (!comment) {
    throw new MyError(req.params.id + " ID-тэй коммэнт олдсонгүй", 400);
  }
  res.json({
    success: true,
    user: await comment.getBook(),
    magic: Object.keys(req.db.comment.prototype),
    data: comment,
  });
});
exports.updateComment = asyncHandler(async (req, res, next) => {
  let comment = await req.db.comment.findByPk(req.params.id);
  if (!comment) {
    throw new MyError(req.params.id + " ID-тэй коммент олдсонгүй", 400);
  }
  comment = await comment.update(req.body);
  res.json({ success: true, data: comment });
});
exports.deleteComment = asyncHandler(async (req, res, next) => {
  let comment = await req.db.comment.findByPk(req.params.id);
  if (!comment) {
    throw new MyError(req.params.id + " ID-тэй Коммент байхгүй", 400);
  }
  comment = await comment.destroy();
  res.json({ success: true, data: comment });
});
exports.getUserComments = asyncHandler(async (req, res, next) => {
  const user = await req.db.user.findByPk(req.params.id);
  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч олдсонгүй", 400);
  }
  // lazy loading
  const comments = await user.getComments();

  res.json({
    success: true,
    user,
    comments,
  });
});
exports.getBookComments = asyncHandler(async (req, res, next) => {
  const book = await req.db.book.findByPk(req.params.id, {
    include: req.db.comment,
  });
  if (!book) {
    throw new MyError(req.params.id + " ID-тэй ном олдсонгүй", 400);
  }
  // eager loading

  res.json({
    success: true,
    book,
  });
});

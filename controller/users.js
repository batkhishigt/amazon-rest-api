const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("../middleware/asyncHandler");
const path = require("path");
const paginate = require("../utils/paginate");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

exports.registerUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  const jwt = user.getJWT();
  res.status(200).json({ success: true, data: user, token: jwt });
});
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  const jwt = user.getJWT();
  res.status(200).json({ success: true, data: user, token: jwt });
});
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);
  if (!email || !password) {
    throw new MyError("Имейл болон нууц үгээ дамжуулна үү", 400);
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new MyError("Имейл болон нууц үгээ зөв оруулна уу", 401);
  }
  const loginchecker = await user.checkPassword(password);
  if (!loginchecker) {
    throw new MyError("Имейл болон нууц үгээ зөв оруулна уу", 401);
  }
  const token = user.getJWT();
  const cookieOption = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res
    .status(200)
    .cookie("amazon-token", token, cookieOption)
    .json({ success: true, token, user });
});
exports.logoutUser = asyncHandler(async (req, res, next) => {
  const cookieOption = {
    expires: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res
    .status(200)
    .cookie("amazon-token", null, cookieOption)
    .json({ success: true, data: "logged out ..." });
});
exports.getUsers = asyncHandler(async (req, res, next) => {
  const select = req.query.select;
  const sort = req.query.sort;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;

  ["select", "sort", "page", "limit"].forEach((el) => {
    delete req.query[el];
  });
  const pagination = await paginate(User, limit, page);
  const users = await User.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  res.json({ success: true, data: users, pagination: pagination });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new MyError(req.params.id + "ID-тэй хэрэглэгч байхгүй", 400);
  }
  res.json({ success: true, data: user });
});
exports.deleteUsers = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new MyError(req.params.id + "ID-тэй хэрэглэгч байхгүй", 400);
  }
  user.remove();
  res.json({ success: true, data: user });
});

exports.updateUsers = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new MyError(req.params.id + "ID-тэй хэрэглэгч байхгүй", 400);
  }
  res.json({ success: true, data: user });
});
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    throw new MyError("Та нууц үг сэргээх имэйл хаягаа илгээнэ үү ", 400);
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    throw new MyError(
      req.body.email + " имэйлтэй хэрэглэгч байхгүй байна",
      400
    );
  }

  const resetToken = user.generatePasswordChangeToken();
  await user.save();
  const link = "https://amazon.mn/changepassword/" + resetToken;
  const message =
    "Сайн байна уу<br> Та нууц үгээ солих хүсэлт илгээлээ.<br> Нууц үгээ доорх линк дээр дарж солино уу:<br><br>" +
    link +
    "<br><br>Өдрийг сайхан өнгөрүүлээрэй.";
  const info = await sendEmail({
    email: req.body.email,
    subject: "Нууц үг өөрчлөх",
    message,
  });
  res.json({ success: true, data: resetToken, message });
});
exports.resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.resetToken || !req.body.password) {
    throw new MyError("Та нууц үг болон токеноо дамжуулна уу", 400);
  }
  const encrypted = crypto
    .createHash("sha256")
    .update(req.body.resetToken)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: encrypted,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    throw new MyError(" Хүчингүй токен байна", 400);
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  const token = user.getJWT();
  res.status(200).json({ success: true, token, user });
});

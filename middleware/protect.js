const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");

exports.protect = asyncHandler(async (req, res, next) => {
  let token = null;

  if (req.headers.authorization) {
    token = authorization.split(" ")[1];
  } else if (req.cookies) {
    token = req.cookies["amazon-token"];
  }

  if (!token) {
    throw new MyError(
      "энэ үйлдлийг хийхэд таны эрх хүрэхгүй байна. Логин хийнэ үү Authorization header эсвэл Cookie --ээ дамжүүлна уу",
      401
    );
  }

  if (!token) {
    throw new MyError(
      "энэ үйлдлийг хийхэд таны эрх хүрэхгүй байна. Логин хийнэ үү2",
      400
    );
  }

  const tokenObj = jwt.verify(token, process.env.JWT_SECRET);
  console.log(tokenObj);
  req.userId = tokenObj.id;
  req.UserRole = tokenObj.role;
  next();
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.UserRole)) {
      throw new MyError(
        "Таны хандах эрх энэ үйлдлийг гүйцэтгэхэд хүрэлцэхгүй байна",
        403
      );
    }
    next();
  };
};

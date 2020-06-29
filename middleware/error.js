const errorHandler = (err, req, res, next) => {
  const error = { ...err };

  error.message = err.message;

  if (error.name === "JsonWebTokenError" && err.message === "invalid token") {
    error.message = "Буруу Токен дамжуулсан байна. ";
    error.statusCode = 400;
  }

  if (err.message === "jwt malformed") {
    error.message = "Та логин хийж байж энэ үйлдлийг хийх боломжтой. ";
    error.statusCode = 401;
  }
  if (error.name === "CastError") {
    error.message = "Энэ ID буруу бүтэцтэй байна";
    error.statusCode = 400;
  }
  if (error.name === "MongoError" && error.code === 11000) {
    error.message = "Энэ талбарын утга давхардуулж өгч болохгүй";
    error.statusCode = 400;
  }
  res.status(error.statusCode || 500).json({ success: false, error: error });
};
module.exports = errorHandler;

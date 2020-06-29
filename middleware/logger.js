const logger = (req, res, next) => {
  console.log(req.method + req.protocol + req.host + req.originalUrl);
  console.log("-----------cookies", req.cookies);
  next();
};
module.exports = logger;

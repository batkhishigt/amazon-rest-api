const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const morgan = require("morgan");
const rfs = require("rotating-file-stream");
const color = require("colors");
const connectDB = require("./config/db");
const categoriesRouters = require("./routes/categories");
const booksRouter = require("./routes/books");
const usersRouter = require("./routes/users");
const commentRouter = require("./routes/comments");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/error");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const expressMongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

dotenv.config({ path: "./config/config.env" });
const db = require("./config/db-mysql");
const injectDB = require("./middleware/injectDB");
const MyError = require("./utils/myError");
const app = express();
connectDB();

var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
});
var whitelist = ["http://localhost:3000", "http://localhost:3000/"];

var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || origin === undefined) {
      callback(null, true);
    } else {
      callback(new Error("Хандалт зөвшөөрөгдөөгүй байна"));
    }
  },
  allowedHeaders: "Authorization, Set-Cookie, Content-Type",
  methods: "GET, POST, PUT, DELETE",
  credentials: true,
};

var appRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Хязгаарлалт хэтэрсэн байна. 15 миниутанд 100 удаа дуудах боломжтой. ",
});
// index.html -ийг public хавтас дотороос олох тохиргоо
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());
app.use(xssClean());
app.use(hpp());
app.use(appRateLimit);
app.use(helmet());
app.use(expressMongoSanitize());
app.use(cors(corsOptions));
app.use(fileUpload());
app.use(logger);
app.use(injectDB(db));
app.use(morgan("combined", { stream: accessLogStream }));
app.use("/api/v1/categories", categoriesRouters);
app.use("/api/v1/books", booksRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/comments", commentRouter);
app.use(errorHandler);

db.user.belongsToMany(db.book, { through: db.comment });
db.book.belongsToMany(db.user, { through: db.comment });

db.user.hasMany(db.comment);
db.comment.belongsTo(db.user);

db.book.hasMany(db.comment);
db.comment.belongsTo(db.book);

db.category.hasMany(db.book);
db.book.belongsTo(db.category);

db.sequelize
  .sync()
  .then((result) => {
    console.log("Sync hiigdlee");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("<h1>hello from Express sercer</h1>");
});

const server = app.listen(
  process.env.PORT,
  console.log("express server running port:" + process.env.PORT)
);
process.on("unhandledRejection", (err, promise) => {
  console.log("error garlaa ====> " + err.message);
  server.close(() => {
    process.exit(1);
  });
});

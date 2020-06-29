const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
const Category = require("./models/category");
const Book = require("./models/book");
const User = require("./models/User");
dotenv.config({ path: "./config/config.env" });
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const categories = JSON.parse(
  fs.readFileSync(__dirname + "/data/categories.json", "utf-8")
);
const books = JSON.parse(
  fs.readFileSync(__dirname + "/data/books.json", "utf-8")
);

const users = JSON.parse(
  fs.readFileSync(__dirname + "/data/users.json", "utf-8")
);
const importData = async () => {
  console.log("Өгөгдлийг импортлолоо .....".green.inverse);
  try {
    await Category.create(categories);
    await Book.create(books);
    await User.create(users);
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  console.log("Өгөгдлийг устгалаа .....".red.inverse);
  try {
    await Category.deleteMany();
    await Book.deleteMany();
    await User.deleteMany();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}

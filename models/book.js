const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Номын нэрийг оруулна уу"],
      unique: true,
      trim: true,
      maxlength: [250, "Номын нэрний урт дээд тал нь 50 тэмдэгт байна."],
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    author: {
      type: String,
      required: [true, "Номын нэрийг оруулна уу"],
      trim: true,
    },
    rating: {
      type: Number,
      min: [1, "Рейтинг хамгийн багадаа 1 байх ёстой"],
      max: [10, "Рейтинг хамгийн ихдээ 10 байх ёстой"],
    },
    price: {
      type: Number,
      required: [true, "Номын тайлбарыг заавал оруулна уу"],
      min: [500, "Номын үнэ доод тал нь 500 тэмдэгт байна."],
    },
    balance: Number,
    content: {
      type: String,
      required: [true, "Номын тайлбарыг заавал оруулна уу"],
      trim: true,
      maxlength: [5000, "Номын тайлбарын урт дээд тал нь 500 тэмдэгт байна."],
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    available: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    updateUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
BookSchema.statics.computeCategoryAveragePrice = async function (categoryId) {
  const obj = await this.aggregate([
    { $match: { category: categoryId } },
    { $group: { _id: "$category", avgPrice: { $avg: "$price" } } },
  ]);
  let avgPrice = null;
  if (obj.length > 0) avgPrice = obj[0].avgPrice;
  await this.model("Category").findByIdAndUpdate(categoryId, {
    averagePrice: avgPrice,
  });
  return obj;
};
BookSchema.post("save", function () {
  this.constructor.computeCategoryAveragePrice(this.category);
});
BookSchema.pre("remove", function () {
  this.constructor.computeCategoryAveragePrice(this.category);
});
BookSchema.virtual("zohiogch").get(function () {
  if (!this.author) return null;
  let tokens = this.author.split(" ");
  if (tokens.length === 1) tokens = this.author.split(".");
  if (tokens.length === 2) return tokens[1];
  return tokens[0];
});
module.exports = mongoose.model("Book", BookSchema);

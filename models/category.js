const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const CategotySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Категорийн нэрийг оруулна уу"],
      unique: true,
      trim: true,
      maxlength: [50, "Категорийн нэрний урт дээд тал нь 50 тэмдэгт байна."],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Категорийн тайлбарыг заавал оруулна уу"],
      maxlength: [
        500,
        "Категорийн тайлбарын урт дээд тал нь 500 тэмдэгт байна.",
      ],
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    averageRating: {
      type: Number,
      min: [1, "Рейтинг хамгийн багадаа 1 байх ёстой"],
      max: [10, "Рейтинг хамгийн ихдээ 10 байх ёстой"],
    },
    averagePrice: Number,
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
CategotySchema.virtual("books", {
  ref: "Book",
  localField: "_id",
  foreignField: "category",
  justOne: false,
});
CategotySchema.pre("remove", async function (next) {
  console.log("removing books");
  await this.model("Book").deleteMany({ category: this._id });
  next();
});

CategotySchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  this.averageRating = Math.floor(Math.random() * 10) + 1;
  //this.averagePrice = Math.floor(Math.random() * 100000) + 3000;
  next();
});

module.exports = mongoose.model("Category", CategotySchema);

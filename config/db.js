const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  console.log(
    "mongoDB холбогдлоо " + conn.connection.host.rainbow.underline.bold
  );
};
module.exports = connectDB;

const mongoose = require("mongoose");
const cities = require("./cities");
const seedHelpers = require("./seedHelpers");
const Campground = require("../models/camground");
const Review = require("../models/review");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/camp-biology", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  await Review.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "609a99f2b7eb3d46ee2d58a1",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: "https://source.unsplash.com/collection/483251",
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officiis minima cupiditate accusamus perferendis laborum unde enim. Consectetur dolorum sit illum saepe eaque doloremque, libero voluptas earum debitis placeat. Qui, blanditiis.",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});

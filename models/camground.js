const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }], // to store and ref each review(based on object id) in an array (one to many)
});

// Delete Middeware: handle and delete any review that associated with campground
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  // console.log(doc);
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews, // https://docs.mongodb.com/manual/reference/operator/query/in/ delete all reviews where their id is in the campground array
      },
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
// The first argument is the singular name of the collection that will be created for your model (Mongoose will create the database collection for the above model SomeModel above)
// The second argument is the schema you want to use in creating the model.

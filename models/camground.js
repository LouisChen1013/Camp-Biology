const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

// https://res.cloudinary.com/dvp8efdz6/image/upload/w_300/v1620876168/Camp-Biology/aqafgpcsu6qrihkqohp3.jpg

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

// https://mongoosejs.com/docs/tutorials/virtuals.html Virtuals in JSON
const opts = { toJSON: { virtuals: true } }; // this will include our virtual properties in our object

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    // https://mongoosejs.com/docs/geojson.html
    geometry: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }], // to store and ref each review(based on object id) in an array (one to many)

    // images: [
    //   {
    //     url: String,
    //     filename: String,
    //   },
    // ],
  },
  opts
);

// https://docs.mapbox.com/help/getting-started/creating-data/ Dataset format
// add properties attribute to our object in order to display on mapbox
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p>`;
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
// The first argument is the singular name of the collection that will be created for your model (Mongoose will create the database collection for the model above)
// The second argument is the schema you want to use in creating the model.

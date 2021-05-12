const Campground = require("../models/camground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  // console.log(req.body.review);
  const review = new Review(req.body.review); // we need to access our review object in order to store the values
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Created new review");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // https://docs.mongodb.com/manual/reference/operator/update/pull/
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review");
  res.redirect(`/campgrounds/${id}`);
};

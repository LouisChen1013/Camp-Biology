const express = require("express");
// since we define our prefix route in app.js (app.use("/campgrounds/:id/reviews", reviews);), we no longer have access to :id.
// We have to set mergeParams: true in order to share the params
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");
const { reviewSchema } = require("../schemas");
const Campground = require("../models/camground");
const Review = require("../models/review");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    // console.log(req.body.review);
    const review = new Review(req.body.review); // we need to access our review object in order to store the values
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created new review");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // https://docs.mongodb.com/manual/reference/operator/update/pull/
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;

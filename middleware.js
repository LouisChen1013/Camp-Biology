const { campgroundSchema, reviewSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/camground");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  // isAuthenticated is a method provided by passport
  if (!req.isAuthenticated()) {
    // store the url users are requesting
    // console.log(req.path, req.originalUrl);
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

// create re-usable middleware using Joi validation for error-handling
module.exports.validateCampground = (req, res, next) => {
  // const campgroundSchema = Joi.object({...}); // we have move our schema into a separate file
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(","); // join error message if more than one
    throw new ExpressError(msg, 400);
  } else {
    next(); // we have to call next() in order to run our next middleware/res
  }
};

module.exports.isAuthor = async (req, res, next) => {
  // To prevent unauthorized people using ajax/postman to update our campground, we have to check our user first
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

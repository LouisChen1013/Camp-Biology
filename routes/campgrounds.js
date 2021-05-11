const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/camground");
const { campgroundSchema } = require("../schemas");

// create re-usable middleware using Joi validation for error-handling
const validateCampground = (req, res, next) => {
  // const campgroundSchema = Joi.object({...}); // we have move our schema into a separate file
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(","); // join error message if more than one
    throw new ExpressError(msg, 400);
  } else {
    next(); // we have to call next() in order to run our next middleware/res
  }
};

router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get("/new", (req, res) => {
  res.render("campgrounds/new");
});

router.post(
  "/",
  validateCampground,
  catchAsync(async (req, res, next) => {
    // const campgroundSchema = Joi.object({
    //   campground: Joi.object({
    //     title: Joi.string().required(),
    //     price: Joi.number().min(0).required(),
    //     image: Joi.string().required(),
    //     location: Joi.string().required(),
    //     description: Joi.string().required(),
    //   }).required(), // this required ensure our req.body have campground object
    // });
    // const { error } = campgroundSchema.validate(req.body);
    // // console.log(result);
    // if (error) {
    //   const msg = error.details.map((el) => el.message).join(","); // join error message if more than one
    //   throw new ExpressError(msg, 400);
    // }

    // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    ); // use populate to get our review details in reviews array
    // When the .findById() method doesn't find a campground it actually does not throw an error but instead, it just returns null
    // So the catchAsync function doesn't get triggered because there wasn't an error thrown.
    if (!campground) {
      req.flash("error", "Cannot find that campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  })
);

router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash("error", "Cannot find that campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);

router.put(
  "/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    //   console.log({ ...req.body.campground });
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
  })
);

module.exports = router;

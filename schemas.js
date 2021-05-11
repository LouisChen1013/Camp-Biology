const Joi = require("joi"); // Joi is a validation library that allows you to build schemas to validate JavaScript objects. https://joi.dev/api/?v=17.4.0

// title,price,image...etc are inside campground object
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().min(0).required(),
    image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
  }).required(), // this required ensure our req.body have campground object
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    body: Joi.string().required(),
  }).required(), // this required ensure our req.body have campground object
});

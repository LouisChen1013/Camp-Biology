const Campground = require("../models/camground");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  // // Move into middleware.js
  // if (!req.isAuthenticated()) {
  //   req.flash("error", "you must be signed in");
  //   return res.redirect("/login");
  // }
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  // console.log(geoData.body.features);
  // console.log(geoData.body.features[0].geometry); // give us GeoJSON
  // console.log(geoData.body.features[0].geometry.coordinates); // give us longitude, latitude

  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  campground.author = req.user._id; // req.user from passport
  // console.log(campground);
  await campground.save();
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  // const campground = await Campground.findById(req.params.id)
  //   .populate("reviews")
  //   .populate("author"); // use populate to get our review details in reviews array
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    }) // to get each review's author
    .populate("author"); // populate campground author

  // When the .findById() method doesn't find a campground it actually does not throw an error but instead, it just returns null
  // So the catchAsync function doesn't get triggered because there wasn't an error thrown.
  if (!campground) {
    req.flash("error", "Cannot find that campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);

  if (!campground) {
    req.flash("error", "Cannot find that campground");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  // console.log({ ...req.body.campground });

  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  imgs = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  campground.images.push(...imgs); // spread the imgs array(get each object) and then using push to add more images (not overwwrite it)
  await campground.save();

  if (req.body.deleteImages) {
    // delete our images in cloudinary
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    //delete our images in mongodb
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    // console.log(campground);
  }
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;

  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground");
  res.redirect("/campgrounds");
};

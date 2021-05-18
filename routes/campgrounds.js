const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");
const campgrounds = require("../controllers/campgrounds");

const multer = require("multer"); // Multer adds a body object and a file or files object to the request object. https://github.com/expressjs/multer#readme
// const upload = multer({ dest: "uploads/" }); // local storage used for development

// define our cloudinary storage in cloudinary.index and pass it to our multer
const { storage } = require("../cloudinary");
const upload = multer({ storage });

// http://expressjs.com/en/5x/api.html#router.route
// chainable route handlers
// router.route(path, method get/post/delete(function))

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

// .post(upload.array("image"), (req, res) => {
//   console.log(req.body, req.files);
//   res.send("it worked");
// });

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;

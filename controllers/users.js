const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = await new User({ email, username });
    const registeredUser = await User.register(user, password);
    //   console.log(registeredUser);
    // http://www.passportjs.org/docs/login/
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Camp Biology");
      res.redirect("/campgrounds");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  // console.log(req);
  const { username } = req.user;
  req.flash("success", `${username}, Welcome Back!`);
  const redirectUrl = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo; // we should delete unnecessary session after we complete the action , in this case returnTo
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "You have been successfully logout");
  res.redirect("/campgrounds");
};

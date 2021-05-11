module.exports = (func) => {
  return function (req, res, next) {
    func(req, res, next).catch(next);
  };
};

// const catchAsync = (func) => {
//   return function (req, res, next) {
//     func(req, res, next).catch((e) => next(e));
//   };
// };

// module.exports = catchAsync;

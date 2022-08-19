const { check, validationResult } = require("express-validator");

exports.signUpValidator = [
  check("name").trim().not().notEmpty().withMessage('Missing "name" field!'),
  check("email")
    .trim()
    .not()
    .notEmpty()
    .withMessage('Missing "email" field')
    .normalizeEmail()
    .isEmail()
    .withMessage(" Email is not correct format!"),
  check("password")
    .trim()
    .not()
    .notEmpty()
    .withMessage('Missing "password" field')
    .isLength({ min: 8, max: 24 })
    .withMessage("Password must be 8 to 24 characters long !"),
];

exports.signInValidator = [
  check("email")
    .trim()
    .not()
    .notEmpty()
    .withMessage('Missing "email" field!')
    .normalizeEmail()
    .isEmail()
    .withMessage("Email is not correct format!"),
  check("password")
    .trim()
    .not()
    .notEmpty()
    .withMessage('Missing "password" field!')
    .isLength({ min: 8, max: 24 })
    .withMessage("Password must be 8 to 24 characters long!"),
];

// exports.createAlbumValidator = [
//   check("name").trim().not().notEmpty().withMessage("Album name is required"),
// ];

exports.validate = (req, res, next) => {
  //return an array of object errors
  const errorInValidate = validationResult(req).array();
  if (errorInValidate.length) {
    return res.json({ error: errorInValidate[0].msg });
  }

  next();
};

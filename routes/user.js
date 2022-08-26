const express = require("express");
const {
  signUp,
  signIn,
  refreshToken,
  enableTwoFactorAuth,
  verify2FA,
  logOut,
  getAllUsers,
} = require("../controllers/user");
const { isAuth } = require("../middlewares/auth");
const {
  signUpValidator,
  signInValidator,
  validate,
} = require("../middlewares/validator");

const router = express.Router();

router.post("/sign-up", signUpValidator, validate, signUp);
router.post("/sign-in", signInValidator, validate, signIn);
router.get("/users", isAuth, getAllUsers);
router.post("/refresh", refreshToken);
router.post("/enable2FA", isAuth, enableTwoFactorAuth);
router.post("/verify2FA", isAuth, verify2FA);
router.post("/logout", isAuth, logOut);
// router.get("/getCookie", getCookie);

router.get("/is-auth", isAuth, (req, res) => {
  const { user } = req;

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerify: user.isVerify,
      base32Secret: user.base32Secret,
    },
  });
});

module.exports = router;

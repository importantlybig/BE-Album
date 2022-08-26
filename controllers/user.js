const User = require("../models/user");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const { isValidObjectId } = require("mongoose");

let refreshTokens = [];

exports.signUp = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(401).json({ error: "This email is already exist !" });

  const newUser = new User({ name, email, password });
  await newUser.save();

  res.status(201).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  });
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  //console.log(!user);
  if (!user) {
    return res
      .status(401)
      .json({ error: "Email or Password is incorrect. Try again !" });
  }

  const checkPasswordMatched = await user.comparePassword(password);
  //console.log(!checkPasswordMatched);
  if (!checkPasswordMatched) {
    return res
      .status(401)
      .json({ error: "Email or Password is incorrect. Try again!" });
  }

  const { _id, name, isVerify } = user;

  const accessToken = jwt.sign(
    { userId: _id },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: "20s",
    }
  );

  const refreshToken = jwt.sign(
    { userId: _id },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: "30d",
    }
  );

  refreshTokens.push(refreshToken);
  console.log(`----array refresh ${refreshTokens}`);
  //STORE REFRESH TOKEN IN COOKIE
  // res.cookie("fssd", "aaa");
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    // path: "/",
    // sameSite: "strict",
  });

  return res.json({
    user: {
      id: _id,
      name,
      isVerify,
      accessToken: accessToken,
      // refreshToken: refreshToken,
    },
  });
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log("------------------>>>>line 88");
  console.log(refreshToken);
  //Send error if token is not valid
  if (!refreshToken) return res.status(401).json("You're not authenticated");
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid");
  }
  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    (err, user) => {
      if (err) {
        console.log(err);
      }

      console.log("user in refresh=------>");
      console.log(user);

      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
      //create new access token, refresh token and send to user
      const newAccessToken = jwt.sign(
        { userId: user.userId },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {
          expiresIn: "30d",
        }
      );
      const newRefreshToken = jwt.sign(
        { userId: user.userId },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        {
          expiresIn: "365d",
        }
      );
      refreshTokens.push(newRefreshToken);
      console.log(`new array refresh: ${refreshTokens}`);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        // path: "/",
        // sameSite: "strict",
      });
      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    }
  );
};

exports.enableTwoFactorAuth = async (req, res) => {
  const { _id: id } = req.user;

  if (!isValidObjectId(id))
    return res.status(401).json({ error: "Invalid User!" });

  const user = await User.findById(id);

  //   const user = await User.findById(id);
  const generateSecret = speakeasy.generateSecret();
  //   console.log(generateSecret);
  //   user.base32Secret = generateSecret.base32;
  qrcode.toDataURL(generateSecret.otpauth_url, async (error, qrImage) => {
    const renderQR = `<img src='${qrImage}' alt='QR_code_scan' />`;
    if (!error) {
      user.base32Secret = generateSecret.base32;
      await user.save();
      return res.json({ renderQR, base32Secret: generateSecret.base32 });
    } else {
      return res.json({ error: error });
    }
  });
};

exports.verify2FA = async (req, res) => {
  const { tokenOTP, base32Secret } = req.body;

  const { _id: id } = req.user;

  const user = await User.findById(id);
  const validate = speakeasy.totp.verify({
    secret: base32Secret,
    encoding: "base32",
    token: tokenOTP,
  });

  if (!validate)
    return res.status(401).send({ error: "Can not verify code, try again!" });

  user.isVerify = true;
  user.save();

  res.status(200).json({ validate });
};

exports.getAllUsers = async (req, res) => {
  const { _id: id } = req.user;

  if (!isValidObjectId(id))
    return res.status(401).json({ error: "Invalid User Id" });

  const users = await User.find({ _id: { $ne: id } });

  res.status(200).json({ users: users });
};

exports.logOut = async (req, res) => {
  res.clearCookie("refreshToken");

  refreshTokens = refreshTokens.filter(
    (token) => token !== req.cookies.refreshToken
  );

  console.log(`line 175: ${refreshTokens}`);
  res.status(200).json("Logged out successfully!");
};

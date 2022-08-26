const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv");

exports.isAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "" });

    const getToken = token.split("Bearer ")[1];
    if (!getToken) return res.status(401).json({ error: "Invalid token!" });

    //console.log(process.env.JWT_SECRET);
    const decode = jwt.verify(getToken, process.env.JWT_ACCESS_TOKEN_SECRET);

    // console.log("decode");
    // console.log(decode);

    const { userId } = decode;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ error: "Invalid token! User not found." });

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: error.message });
  }
};

// const express = require("express");
// const app = express();

// app.use("/static", express.static("public"));

// app.listen(3000);

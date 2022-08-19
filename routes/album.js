const express = require("express");
const { isAuth } = require("../middlewares/auth");
// const { createAlbumValidator, validate } = require("../middlewares/validator");
const { createAlbum, getAlbumByOwner } = require("../controllers/album");

const router = express.Router();

router.post("/create", isAuth, createAlbum);
// router.get("/getAlbumByOwner/:ownerId", isAuth, getAlbumByOwner);
router.get("/getAlbumByOwner/:ownerId", getAlbumByOwner);

module.exports = router;

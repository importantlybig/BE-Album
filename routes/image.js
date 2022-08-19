const express = require("express");
const {
  createImage,
  getImageByAlbum,
  getImage,
  getImageById,
  getImageFolderDZI,
  shareImageToUser,
  deleteImage,
  updateImage,
} = require("../controllers/image");
const { isAuth } = require("../middlewares/auth");
const { uploadImage } = require("../middlewares/multer");

const router = express.Router();

router.post(
  "/upload-single/:albumId",
  isAuth,
  uploadImage.single("image"),
  createImage
);
router.get("/image-by-album/:albumId", getImageByAlbum);
router.get("/getImage/", getImage);
router.get("/image-by-id/:imageId", isAuth, getImageById);
router.get("/get-image-for-os/:file/:number/:name", getImageFolderDZI);
router.post("/share-image-to-user/:imageId", isAuth, shareImageToUser);
router.delete("/delete-image/:imageId", isAuth, deleteImage);
router.patch("/update-image/:imageId", isAuth, updateImage);

module.exports = router;

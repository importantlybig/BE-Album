// const User = require('../models/user')
const Album = require("../models/album");
const Image = require("../models/image");
const { isValidObjectId } = require("mongoose");
const sharp = require("sharp");
const unzipper = require("unzipper");
const path = require("path");
const fs = require("fs");
const fsEx = require("fs-extra");
const { awaitToResponse } = require("../middlewares/helper");
const image = require("../models/image");

exports.createImage = async (req, res) => {
  const { _id: id } = req.user;
  const { albumId } = req.params;
  const { name } = req.body;

  const { file } = req;

  console.log(file);

  const pathOfFile = file.path;

  // console.log(pathOfFile);
  let pathEdit = pathOfFile.split("\\")[1];
  pathEdit = pathEdit.split(".")[0] + ".png";

  // console.log(`Path edit ${pathEdit}`);

  console.log(file);

  if (!id) return res.status(401).json({ error: "User not found!" });

  if (!albumId) return res.status(401).json({ error: "Album not found!" });

  if (!file)
    return res.status(401).json({ error: "Upload failed, try again!" });

  if (!name) {
    return res.status(401).json({ error: "Image name is missing!" });
  }

  const { originalname, path: pathName, filename } = file;

  // console.log(`30: path name: ${pathName}`);
  // console.log(`31: file name: ${filename}`);

  //Sharp here
  const sharpResultInfro = await sharp(pathName)
    .toFormat("png")
    .tile({
      size: 256,
      overlap: 0,
      container: "fs",
      layout: "dz",
    })
    .toFile("imageContainer/" + filename.split(".")[0] + ".zip");

  //Unzip folder which created by Sharp using unzipper
  fs.createReadStream("imageContainer/" + filename.split(".")[0] + ".zip").pipe(
    unzipper.Extract({ path: "imageContainer/" })
  );

  // //---------------Delete file ZIPPPPPPPPPPP
  const pathNameBeforeDelete = path.join(__dirname, `../imageContainer/`);
  fs.stat(pathNameBeforeDelete, function (err, stats) {
    //here we got all information of file in stats variable
    //console.log(stats);

    if (err) {
      return console.error(err);
    }

    const pathToDelete =
      path.join(__dirname, `../imageContainer/`) +
      filename.split(".")[0] +
      ".zip";

    fs.unlink(pathToDelete, function (err) {
      if (err) return console.log(err);
      console.log("file deleted successfully");
    });
  });

  const oldPathMove = path.join(__dirname, `../imageContainer/`) + filename;
  const newPathMove =
    path.join(__dirname, `../imageContainer/`) +
    filename.split(".")[0] +
    "/" +
    filename.split(".")[0] +
    ".png";
  const fileMoveExist = path.join("imageContainer/") + filename.split(".")[0];
  // console.log(`Old: ${oldPathMove}`);
  // console.log(`New: ${newPathMove}`);
  // console.log(`dir exist: ${fileMoveExist}`);

  await awaitToResponse(1000);
  // .then(() => {
  //-------------------check if directory exists
  if (fs.existsSync(fileMoveExist)) {
    console.log("Directory exists!");
    fs.rename(oldPathMove, newPathMove, function (err) {
      if (err) throw err;
      console.log("Successfully renamed - AKA moved!");
    });
  } else {
    console.log("Directory not found.");
  }
  // });

  const album = await Album.findById(albumId);

  const newImage = new Image({
    name: name,
    path: pathEdit,
    owner: id,
    width: sharpResultInfro.width,
    height: sharpResultInfro.height,
    parentAlbum: albumId,
  });
  await newImage.save();

  album.images.push(newImage._id);
  await album.save();

  res.status(201).json({
    image: {
      id: newImage._id,
      name: newImage.name,
      path: newImage.Path,
      width: sharpResultInfro.width,
      height: sharpResultInfro.height,
      owner: newImage.owner,
      parentAlbum: newImage.parentAlbum,
    },
  });
};

exports.getImage = async (req, res) => {
  const { file } = req.query;

  console.log(file);

  const path = "./imageContainer/" + file.split(".")[0];
  if (fs.existsSync(path))
    res.sendFile(file, {
      root: path,
    });
};

exports.getImageById = async (req, res) => {
  const { imageId } = req.params;
  const { _id: id } = req.user;

  if (!isValidObjectId(imageId))
    return res.status(401).json({ error: "Invalid Image ID" });

  const image = await Image.findById(imageId).populate("owner");
  // .populate("parentAlbum");
  console.log("id userrrrrrrrr");
  console.log(id);
  console.log(image.owner);
  // console.log(image.owner);

  if (
    image.owner._id.toString() === id.toString() ||
    image.ShareTo.includes(id.toString())
  ) {
    res.status(200).json({ result: image, status: true });
  } else {
    res.status(200).json({ status: false });
  }
};

exports.getImageFolderDZI = async (req, res) => {
  const { name, file, number } = req.params;

  res.sendFile(name, {
    root: "./imageContainer/" + file + "/" + file + "_files/" + number,
  });
};

exports.getImageByAlbum = async (req, res) => {
  const { albumId } = req.params;

  if (!isValidObjectId(albumId))
    return res.status(401).error({ error: "Invalid Album ID!" });

  const albumResult = await Album.findById(albumId).populate("images");

  //console.log(albumResult);
  const { images } = albumResult;

  res.status(200).json({ images });

  // const image = await Image.findById(imageId)

  // const { path } = image
  // // console.log(image);

  // return res.status(200).json({image})
};

exports.shareImageToUser = async (req, res) => {
  const { userShareId } = req.body;
  const { imageId } = req.params;

  if (!isValidObjectId(userShareId))
    return res.status(401).json({ error: "Invalid User share ID" });

  if (!isValidObjectId(imageId))
    return res.status(401).json({ error: "Invalid Image share ID" });

  const imageToShare = await Image.findById(imageId);

  if (imageToShare.ShareTo.includes(userShareId)) {
    return res.json({
      error: "Image shared to this user, choose another one!",
    });
  } else {
    imageToShare.ShareTo.push(userShareId);
    // imageToShare.ShareTo.push(imageToShare._id);
    await imageToShare.save();
  }

  return res.json({
    result: imageToShare,
    success: "Image share successfully",
  });
};

// remove image
// tim id image trong model image
// co ket qua cua image moi
// tim trong bang album va select field "image"
// album.images = album.images.filter((imageId) => imageId.toString() !== imageId)
// 	await Image.findByIdAndDelete(imageId)
//  await album.save()
// res.json({ message: 'Review removed successfully.' })
//  fsExtra.removeSync("imgs/" + imgs.filename.split(".")[0]);
exports.deleteImage = async (req, res) => {
  const { imageId } = req.params;
  const { _id: id } = req.user;

  if (!isValidObjectId(id))
    return res.status(401).json({ error: "Invalid User ID" });

  if (!isValidObjectId(imageId))
    return res.status(401).json({ error: "Invalid Image share ID" });

  const image = await Image.findOne({ owner: id, _id: imageId });
  if (!image) return res.status(401).json({ error: "Invalid request!" });

  console.log("image in delete image");
  console.log(image);

  const folderToDelete = await image.path.split(".")[0];

  fsEx.removeSync(`./imageContainer/${folderToDelete}`, (err) => {
    if (err) {
      return console.log("error occurred in deleting directory", err);
    }
    console.log("Directory deleted successfully");
  });

  console.log("folder to delete");
  console.log(folderToDelete);

  const album = await Album.findById(image.parentAlbum).select("images");
  console.log("album in delete");
  console.log(album);

  const indexImage = album.images.indexOf(imageId);

  album.images.splice(indexImage, 1);

  // album.images = album.images.in(
  //   (imageId) => imageId.toString() !== imageId
  // );
  console.log("after delete");
  console.log(album);

  await Image.findByIdAndDelete(imageId);
  await album.save();
  res.json({ success: "Image removed successfully." });
};

exports.updateImage = async (req, res) => {
  const { imageId } = req.params;
  const { name } = req.body;
  const { _id: id } = req.user;

  if (!isValidObjectId(imageId))
    return res.status(401).json({ error: "Invalid Image ID" });
  if (!isValidObjectId(id))
    return res.status(401).json({ error: "Invalid User ID" });

  if (!name) return res.status(401).json({ error: 'Missing "name" field!' });

  const image = await Image.findOne({ owner: id, _id: imageId });

  console.log(image);

  image.name = name;
  await image.save();

  res.status(200).json({ success: "Update Image successfully!" });
};

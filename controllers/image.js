const Album = require("../models/album");
const Image = require("../models/image");

const fs = require("fs");
const fsEx = require("fs-extra");

const { isValidObjectId } = require("mongoose");
const {
  handleSingleImageWithSharp,
  handleMultipleImagesWithSharp,
} = require("../middlewares/helper");

//PM2
const SingleUploadQueue = require("../queues/singleUpload-Woker1");
// const {
//   sendValueToMultipleUploadQueue,
// } = require("../queues/multipleUpload-Woker2");

exports.uploadSingleImage = async (req, res) => {
  const { _id: id } = req.user;
  const { albumId } = req.params;
  const { name } = req.body;

  const { file } = req;

  console.log("----------type of file");
  console.log(typeof file);

  // const singleFile = file

  console.log("--file in line 33");
  console.log(file);

  const pathOfFile = file.path;

  // console.log(pathOfFile);
  let pathEdit = pathOfFile.split("\\")[1];
  pathEdit = pathEdit.split(".")[0] + ".png";

  // console.log(`Path edit ${pathEdit}`);

  if (!id) return res.status(401).json({ error: "User not found!" });

  if (!albumId) return res.status(401).json({ error: "Album not found!" });

  if (!file)
    return res.status(401).json({ error: "Upload failed, try again!" });

  if (!name) {
    return res.status(401).json({ error: "Image name is missing!" });
  }

  const sharpResultInfo = await handleSingleImageWithSharp(file);
  // const sharpResultInfo = SingleUploadQueue(file);

  // console.log("result in worker");
  // console.log(sharpResultInfo);

  const album = await Album.findById(albumId);

  const newImage = new Image({
    name: name,
    path: pathEdit,
    owner: id,
    width: sharpResultInfo.width,
    height: sharpResultInfo.height,
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
      width: sharpResultInfo.width,
      height: sharpResultInfo.height,
      owner: newImage.owner,
      parentAlbum: newImage.parentAlbum,
    },
  });
};

exports.uploadMultipleImages = async (req, res) => {
  const { _id: id } = req.user;
  const { albumId } = req.params;
  const { multipleNames } = req.body;

  console.log(multipleNames);

  const parse = JSON.parse(multipleNames);

  console.log("-------parrse name");
  console.log(parse);

  const { files } = req;

  console.log(files);

  if (!id) return res.status(401).json({ error: "User not found!" });

  if (!albumId) return res.status(401).json({ error: "Album not found!" });

  if (!files)
    return res.status(401).json({ error: "Upload failed, try again!" });

  if (!multipleNames) {
    return res.status(401).json({ error: "Image name is missing!" });
  }

  for (let i = 0; i < files.length; i++) {
    // let pathEdit = [];
    let pathEdit = files[i].path.split("\\")[1];
    pathEdit = pathEdit.split(".")[0] + ".png";

    const sharpResult = await handleMultipleImagesWithSharp(files[i]);

    const album = await Album.findById(albumId);

    const newImage = new Image({
      name: parse[i],
      path: pathEdit,
      owner: id,
      width: sharpResult.width,
      height: sharpResult.height,
      parentAlbum: albumId,
    });
    await newImage.save();

    album.images.push(newImage._id);
    await album.save();
  }

  return res
    .status(201)
    .json({ success: "Upload multiple images successfully!" });
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
  const { updateName } = req.body;
  const { _id: id } = req.user;

  if (!isValidObjectId(imageId))
    return res.status(401).json({ error: "Invalid Image ID" });
  if (!isValidObjectId(id))
    return res.status(401).json({ error: "Invalid User ID" });

  if (!updateName)
    return res.status(401).json({ error: 'Missing "name" field!' });

  const image = await Image.findOne({ owner: id, _id: imageId });

  console.log(image);

  image.name = updateName;
  await image.save();

  res.status(200).json({ success: "Update Image successfully!" });
};

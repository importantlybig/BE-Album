const sharp = require("sharp");
const fs = require("fs");
const unzipper = require("unzipper");
const path = require("path");

exports.generateRandomString = (string_length = 6) => {
  let randomString = "";
  for (let i = 1; i <= string_length; i++) {
    const randomVal = Math.round(Math.random() * 9);
    randomString += randomVal;
  }

  return randomString;
};

const awaitToResponse = (millisecond) => {
  return new Promise((resolve) => {
    setTimeout(resolve, millisecond);
  });
};

exports.handleSingleImageWithSharp = async (file) => {
  //Handle image with sharp
  const sharpResult = await sharp(file.path)
    .toFormat("png")
    .tile({
      size: 256,
      overlap: 0,
      container: "fs",
      layout: "dz",
    })
    .toFile("imageContainer/" + file.filename.split(".")[0] + ".zip");

  //Unzip folder which created by Sharp using unzipper
  fs.createReadStream(
    "imageContainer/" + file.filename.split(".")[0] + ".zip"
  ).pipe(unzipper.Extract({ path: "imageContainer/" }));

  // //---------------Delete file ZIPPPPPPPPPPP

  const pathNameBeforeDelete = await path.join(__dirname, `../imageContainer/`);

  fs.stat(pathNameBeforeDelete, function (err, stats) {
    //here we got all information of file in stats variable
    //console.log(stats);

    if (err) {
      return console.error(err);
    }

    const pathToDelete =
      path.join(__dirname, `../imageContainer/`) +
      file.filename.split(".")[0] +
      ".zip";

    fs.unlink(pathToDelete, function (err) {
      if (err) return console.log(err);
      console.log("file deleted successfully");
    });
  });

  const oldPathMove =
    path.join(__dirname, `../imageContainer/`) + file.filename;
  const newPathMove =
    path.join(__dirname, `../imageContainer/`) +
    file.filename.split(".")[0] +
    "/" +
    file.filename.split(".")[0] +
    ".png";
  const fileMoveExist =
    path.join("imageContainer/") + file.filename.split(".")[0];
  // console.log(`Old: ${oldPathMove}`);
  // console.log(`New: ${newPathMove}`);
  // console.log(`dir exist: ${fileMoveExist}`);

  await awaitToResponse(1000).then(() => {
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
  });

  return sharpResult;
};

exports.handleMultipleImagesWithSharp = async (files) => {
  const sharpResult = await sharp(files.path)
    .toFormat("png")
    .tile({
      size: 256,
      overlap: 0,
      container: "fs",
      layout: "dz",
    })
    .toFile("imageContainer/" + files.filename.split(".")[0] + ".zip");

  //Unzip folder which created by Sharp using unzipper
  fs.createReadStream(
    "imageContainer/" + files.filename.split(".")[0] + ".zip"
  ).pipe(unzipper.Extract({ path: "imageContainer/" }));

  // //---------------Delete file ZIPPPPPPPPPPP

  const pathNameBeforeDelete = await path.join(__dirname, `../imageContainer/`);
  fs.stat(pathNameBeforeDelete, function (err, stats) {
    //here we got all information of file in stats variable
    //console.log(stats);

    if (err) {
      return console.error(err);
    }

    const pathToDelete =
      path.join(__dirname, `../imageContainer/`) +
      files.filename.split(".")[0] +
      ".zip";

    fs.unlink(pathToDelete, function (err) {
      if (err) return console.log(err);
      console.log("file deleted successfully");
    });
  });

  const oldPathMove =
    path.join(__dirname, `../imageContainer/`) + files.filename;
  const newPathMove =
    path.join(__dirname, `../imageContainer/`) +
    files.filename.split(".")[0] +
    "/" +
    files.filename.split(".")[0] +
    ".png";
  const fileMoveExist =
    path.join("imageContainer/") + files.filename.split(".")[0];
  // console.log(`Old: ${oldPathMove}`);
  // console.log(`New: ${newPathMove}`);
  // console.log(`dir exist: ${fileMoveExist}`);

  await awaitToResponse(1000).then(() => {
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
  });

  return sharpResult;
};

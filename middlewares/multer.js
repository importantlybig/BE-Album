const multer = require("multer");
const { generateRandomString } = require("./helper");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "imageContainer");
  },
  filename: (req, file, cb) => {
    const extensionOfImage = file.originalname.split(".")[1];
    cb(null, generateRandomString() + "." + extensionOfImage);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb("File extension is incorrect, try again!", false);
  }
};

// const fileFilter = (req, file, callback) => {
//     var ext = path.extname(file.originalname)
//     if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
//         return callback('File extension is incorrect, try again!', false)
//     }

//     callback(null, true)
// }

exports.uploadImage = multer({ storage, fileFilter });

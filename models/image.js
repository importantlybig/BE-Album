const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const imageSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    path: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "private",
      emum: ["private", "public"],
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    owner: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    ShareTo: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
    parentAlbum: {
      type: ObjectId,
      ref: "Album",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);

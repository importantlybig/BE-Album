const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const albumSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    images: [
      {
        type: ObjectId,
        ref: "Image",
        //: { type: ObjectId, ref: "Image" },
      },
    ],
    owner: {
      type: ObjectId,
      ref: "User",
    },
    shareTo: [
      {
        user: {
          type: ObjectId,
          ref: "User",
        },
        album: {
          type: ObjectId,
          ref: "Album",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Album", albumSchema);

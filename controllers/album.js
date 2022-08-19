const { isValidObjectId } = require("mongoose");
const Album = require("../models/album");

exports.createAlbum = async (req, res) => {
  const { name } = req.body;
  //const albumOnwer = req.user._id

  //console.log(name);

  // const existingAlbumName = await Album.findOne({ name })
  // if(existingAlbumName) return res.status(401).json({ error: 'This name is already taken! Please enter the new one.' })

  if (!name) return res.status(401).json({ error: "Invalid Album name" });

  const newAlbum = new Album({ name, owner: req.user });
  await newAlbum.save();

  res.json({ success: "Album Created!" });
};

exports.getAlbumByOwner = async (req, res) => {
  const { ownerId } = req.params;

  console.log(`line 24 ${ownerId}`);

  if (!isValidObjectId(ownerId))
    return res.status(401).json({ error: "Not found!" });

  //const ownerResult = await (await Album.find({owner: ownerId}).select('-owner'))
  const ownerResult = await await Album.find({ owner: ownerId })
    .populate("images")
    .populate({
      path: "owner",
      select: "-password",
    });

  // console.log(ownerResult);

  res.json({
    albumInfo: ownerResult,
  });
};

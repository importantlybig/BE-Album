const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();
require("./db");

const userRouter = require("./routes/user");
const albumRouter = require("./routes/album");
const imageRouter = require("./routes/image");

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
//V4.16.0 alternate for body-parser
app.use(express.json());
app.use(morgan("dev"));

// app.use(
//   "/imageContainer",
//   express.static(path.join(__dirname, "imageContainer"))
// );

app.use("/api/user", userRouter);
app.use("/api/album", albumRouter);
app.use("/api/image", imageRouter);

const port = 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}!`);
});

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      require: true,
    },
    email: {
      type: String,
      trim: true,
      require: true,
      // unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
    base32Secret: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

userSchema.methods.comparePassword = async function (password) {
  const result = await bcrypt.compare(password, this.password);
  console.log(`Compare password: ${result}`);

  return result;
};

module.exports = mongoose.model("User", userSchema);

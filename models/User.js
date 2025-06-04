import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { type: String },
    provider: {
      type: String,
      enum: ["google", "facebook", "standard"],
      default: "standard",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);

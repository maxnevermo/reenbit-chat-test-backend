import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      text: { type: String },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date },
      status: {
        type: String,
        enum: ["sent", "seen", "waiting"],
        default: "sent",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);

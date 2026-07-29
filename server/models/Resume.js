import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: String,
    atsScore: Number,
    suggestions: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);

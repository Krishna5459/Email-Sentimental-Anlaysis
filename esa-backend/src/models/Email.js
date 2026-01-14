import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    subject: { type: String, default: "" },
    body: { type: String, required: true },
    sentiment: { type: String, default: null },
    recommendation: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Email", emailSchema);

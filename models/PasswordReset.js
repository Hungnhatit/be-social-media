import mongoose, { Schema } from "mongoose";

const passwordResetSchema = Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      unique: true,
    },
    email: {
      type: Schema.Types.ObjectId,
      unique: true,
    },
    token: String,
    createdAt: Date,
    expiresAt: Date,
  }
);

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);

export default PasswordReset;
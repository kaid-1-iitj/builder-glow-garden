import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "society_user" | "agent";
  societyId?: mongoose.Types.ObjectId;
  permissions: {
    canRead: boolean;
    canWrite: boolean;
  };
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "society_user", "agent"],
      required: true,
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: function (this: IUser) {
        return this.role !== "admin";
      },
    },
    permissions: {
      canRead: {
        type: Boolean,
        default: true,
      },
      canWrite: {
        type: Boolean,
        default: false,
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes
UserSchema.index({ email: 1 });
UserSchema.index({ societyId: 1, role: 1 });

export default mongoose.model<IUser>("User", UserSchema);

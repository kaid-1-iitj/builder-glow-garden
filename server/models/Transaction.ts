import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  vendorName: string;
  nature: string;
  amount?: number;
  status:
    | "pending_on_society"
    | "pending_on_agent"
    | "pending_for_clarification"
    | "completed";
  remarks: Array<{
    text: string;
    author: mongoose.Types.ObjectId;
    timestamp: Date;
    type: "info" | "clarification" | "approval" | "rejection";
  }>;
  attachments: Array<{
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  }>;
  createdBy: mongoose.Types.ObjectId;
  societyId: mongoose.Types.ObjectId;
  assignedToAgent?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    vendorName: {
      type: String,
      required: true,
      trim: true,
    },
    nature: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending_on_society",
        "pending_on_agent",
        "pending_for_clarification",
        "completed",
      ],
      default: "pending_on_society",
    },
    remarks: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
        },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          enum: ["info", "clarification", "approval", "rejection"],
          default: "info",
        },
      },
    ],
    attachments: [
      {
        fileName: {
          type: String,
          required: true,
        },
        filePath: {
          type: String,
          required: true,
        },
        fileSize: {
          type: Number,
          required: true,
        },
        mimeType: {
          type: String,
          required: true,
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    assignedToAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes
TransactionSchema.index({ societyId: 1, status: 1 });
TransactionSchema.index({ assignedToAgent: 1, status: 1 });
TransactionSchema.index({ createdBy: 1 });
TransactionSchema.index({ createdAt: -1 });

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);

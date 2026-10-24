import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemConfig extends Document {
  key: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  minRequiredVersion: string;
  latestVersion: string;
  apkDownloadUrl: string;
  updatedBy?: string;
  updatedAt: Date;
  createdAt: Date;
}

const systemConfigSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: {
      type: String,
      default: 'College Event App is currently undergoing scheduled maintenance. We will be back shortly with an improved experience!',
    },
    minRequiredVersion: { type: String, default: '1.0.0' },
    latestVersion: { type: String, default: '1.0.0' },
    apkDownloadUrl: {
      type: String,
      default: 'https://giet-a-event-manager.onrender.com/download/app',
    },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISystemConfig>('SystemConfig', systemConfigSchema);

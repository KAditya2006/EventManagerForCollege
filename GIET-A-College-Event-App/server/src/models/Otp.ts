import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  consumed: boolean;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    consumed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically remove expired OTPs after a while (e.g., 5 mins after expiry)
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 300 });

export default mongoose.model<IOtp>('Otp', OtpSchema);

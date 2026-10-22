import mongoose, { Schema, Document } from 'mongoose';

export enum RegistrationStatus {
  REGISTERED = 'REGISTERED',
  CANCELLED = 'CANCELLED' // In case we need it later, though not explicitly required now
}

export interface IRegistration extends Document {
  student: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  status: RegistrationStatus;
  qrToken: string;
  checkedIn: boolean;
  checkedInAt?: Date;
  checkedInBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    status: {
      type: String,
      enum: Object.values(RegistrationStatus),
      default: RegistrationStatus.REGISTERED,
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
    checkedInBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  {
    timestamps: true,
  }
);

// A student can register for an event only once
registrationSchema.index({ student: 1, event: 1 }, { unique: true });

// Useful indexes for querying
registrationSchema.index({ student: 1, createdAt: -1 });
registrationSchema.index({ event: 1 });

export default mongoose.model<IRegistration>('Registration', registrationSchema);

import mongoose, { Schema, Document } from 'mongoose';

export enum RegistrationStatus {
  REGISTERED = 'REGISTERED',
  CANCELLED = 'CANCELLED' // In case we need it later, though not explicitly required now
}

export interface IRegistration extends Document {
  student: mongoose.Types.ObjectId;
  studentName?: string;
  studentEmail?: string;
  studentRollNumber?: string;
  studentBranch?: string;
  studentPhone?: string;
  event: mongoose.Types.ObjectId;
  eventTitle?: string;
  eventCategory?: string;
  eventDate?: Date;
  eventVenue?: string;
  eventTime?: string;
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
    studentName: { type: String, trim: true },
    studentEmail: { type: String, trim: true, lowercase: true },
    studentRollNumber: { type: String, trim: true },
    studentBranch: { type: String, trim: true },
    studentPhone: { type: String, trim: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    eventTitle: { type: String, trim: true },
    eventCategory: { type: String, trim: true },
    eventDate: { type: Date },
    eventVenue: { type: String, trim: true },
    eventTime: { type: String, trim: true },
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

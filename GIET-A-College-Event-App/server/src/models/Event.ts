import mongoose, { Schema, Document } from 'mongoose';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface IWinner {
  position: number; // 1, 2, or 3
  studentId?: mongoose.Types.ObjectId;
  name: string;
  rollNumber?: string;
  branch?: string;
  prize?: string;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  venue: string;
  organizer: string;
  category?: string;
  capacity?: number;
  poster?: string;
  evidenceImages?: string[];
  status: EventStatus;
  winners?: IWinner[];
  winnersAnnouncedAt?: Date;
  completedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    venue: { type: String, required: true },
    organizer: { type: String, required: true },
    category: { type: String },
    capacity: { type: Number },
    poster: { type: String },
    evidenceImages: {
      type: [String],
      default: [],
      validate: [
        (val: string[]) => val.length <= 10,
        'Maximum 10 evidence images allowed per event.',
      ],
    },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.DRAFT,
    },
    winners: [
      {
        position: { type: Number, required: true },
        studentId: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, required: true },
        rollNumber: { type: String },
        branch: { type: String },
        prize: { type: String },
      },
    ],
    winnersAnnouncedAt: { type: Date },
    completedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

// Indexes to speed up discovery
eventSchema.index({ status: 1, date: 1 }); // Commonly filtering published events by date
eventSchema.index({ title: 'text', description: 'text' }); // Allow basic text searching
eventSchema.index({ category: 1 }); // Filtering by category

export default mongoose.model<IEvent>('Event', eventSchema);

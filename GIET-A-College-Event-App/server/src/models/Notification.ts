import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  REGISTRATION_CONFIRMED = 'REGISTRATION_CONFIRMED',
  EVENT_UPDATED = 'EVENT_UPDATED',
  EVENT_CANCELLED = 'EVENT_CANCELLED',
  ATTENDANCE_CONFIRMED = 'ATTENDANCE_CONFIRMED',
  WINNERS_ANNOUNCED = 'WINNERS_ANNOUNCED',
}

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  event?: mongoose.Types.ObjectId;
  registration?: mongoose.Types.ObjectId;
  createdAt: Date;
  readAt?: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event' },
    registration: { type: Schema.Types.ObjectId, ref: 'Registration' },
    readAt: { type: Date },
  },
  { timestamps: true }
);

// Index for getting a user's notifications sorted by newest first
NotificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);

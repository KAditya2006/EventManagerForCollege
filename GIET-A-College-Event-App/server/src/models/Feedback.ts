import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  event: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  registration: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registration: {
      type: Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value',
      },
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // we don't need updatedAt if feedback is immutable
  }
);

// Prevent duplicate feedback
FeedbackSchema.index({ event: 1, student: 1 }, { unique: true });

const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;

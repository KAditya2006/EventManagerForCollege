import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export interface IUser extends Document {
  email: string;
  name?: string;
  rollNumber?: string;
  phone?: string;
  course?: string;
  branch?: string;
  year?: string;
  semester?: string;
  section?: string;
  role: UserRole;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    year: {
      type: String,
      trim: true,
    },
    semester: {
      type: String,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);

import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserDoc extends Document {
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  role: UserRole;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    department: { type: String },
  },
  { timestamps: true }
);

// No bcrypt — using Node's built-in crypto to avoid native binary issues on Windows
UserSchema.methods.verifyPassword = function (plain: string): boolean {
  const hash = crypto
    .pbkdf2Sync(plain, this.passwordSalt, 10000, 64, 'sha512')
    .toString('hex');
  return hash === this.passwordHash;
};

UserSchema.statics.hashPassword = function (plain: string): {
  hash: string;
  salt: string;
} {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(plain, salt, 10000, 64, 'sha512')
    .toString('hex');
  return { hash, salt };
};

export const UserModel = mongoose.model<UserDoc>('User', UserSchema);
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please add a full name'],
    },
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    occupationType: {
      type: String,
      enum: ['student', 'working_professional'],
      required: [true, 'Please select whether you are a student or working professional'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    securityQuestion: {
      type: String,
      required: [true, 'Please add a security question'],
      trim: true,
    },
    securityAnswerHash: {
      type: String,
      required: [true, 'Please add a security answer'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    purgeAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index(
  { purgeAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { isDeleted: true },
  }
);

const User = mongoose.model('User', userSchema);

export default User;

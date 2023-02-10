/** @format */

// import env from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { EXPIRES_TOKEN } from '#constants';

const userSchema = new mongoose.Schema(
  {
    gender: { type: Boolean, default: true },
    phone: { type: String, trim: true, default: '', maxlength: 11 },
    email: { type: String, trim: true, default: '', maxlength: 50 },
    password: { type: String, trim: true, default: '', maxlength: 50 },
    profile: {
      fullName: { type: String, trim: true, default: '', maxlength: 50 },
      about: { type: String, trim: true, default: '', maxlength: 255 },
      address: { type: String, trim: true, default: '', maxlength: 100 },
      dob: { type: String, trim: true, default: '', maxlength: 30 },
      location: {
        lat: { type: Number, default: null, maxlength: 30 },
        long: { type: Number, default: null, maxlength: 30 },
      },
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      minlength: 8,
      maxlength: 50,
    },
    status: {
      default: null,
      type: [
        {
          code: { type: Number, default: null },
          text: { type: String, default: null },
        },
      ],
    },
    contracts: {
      personalTrainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        default: null,
      },
      membership: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        default: null,
      },
    },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'roles', required: true }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'groups', default: null }],
    images: {
      type: {
        avatar: {
          default: null,
          type: {
            url: { type: String, default: '' },
            id: { type: String, default: '' },
          },
        },
        wallPaper: {
          type: {
            url: { type: String, default: '' },
            id: { type: String, default: '' },
          },
          default: null,
        },
      },
    },
  },
  { timestamps: true },
);

userSchema.static('generateJWT', function (userId) {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: EXPIRES_TOKEN,
  });
});

userSchema.static('generateRefreshJWT', function (userId) {
  return jwt.sign({ _id: userId }, process.env.JWT_REFRESH_KEY, { expiresIn: '30d' });
});

userSchema.static('validJWT', function (accessToken) {
  return jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
});

userSchema.static('validRefreshJWT', function (refreshToken) {
  return jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
});

userSchema.static('encryptPassword', function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
});

userSchema.static('validPassword', function (password, hash) {
  return bcrypt.compareSync(password, hash);
});

userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
    return next();
  }
});

export default userSchema;

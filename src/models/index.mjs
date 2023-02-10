/** @format */

// import env from 'dotenv';
import { EXPIRES_OTP } from '#constants';
import mongoose_delete from 'mongoose-delete';
import mongoose from 'mongoose';
import userSchema from './user.mjs';

// env.config();

//====================================OTP========================================>>
const otpSchema = new mongoose.Schema(
  {
    otp: { type: String, required: true },
    phone: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: EXPIRES_OTP } },
  },
  { timestamps: true },
);

//====================================ROLES========================================>>
const roleSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, require: true, unique: true },
    description: { type: String, trim: true, require: true },
  },
  { timestamps: true },
);

//====================================FEATURES=====================================>>
const featureSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, require: true },
    group: { type: String, trim: true, require: true },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'roles', default: null }],
  },
  { timestamps: true },
);

//====================================ODER=========================================>>
const oderSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  },
  { timestamps: true },
);

const checkInSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'groups' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  },
  { timestamps: true },
);

//====================================USERS========================================>>

//====================================CATEGORY========================================>>
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: null },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: null },
    images: {
      avatar: {
        url: { type: String, default: '' },
        id: { type: String, default: '' },
      },
      wallPaper: {
        url: { type: String, default: '' },
        id: { type: String, default: '' },
      },
    },
  },
  { timestamps: true },
);

//====================================PRODUCT========================================>>
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    producer: { type: String, required: true },
    description: { type: String, trim: true, default: '', maxlength: 255 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    mfg: { type: Date, required: true },
    exp: { type: Date, required: true },
    images: {
      avatar: {
        url: { type: String, default: '' },
        id: { type: String, default: '' },
      },
      wallPaper: {
        url: { type: String, default: '' },
        id: { type: String, default: 'no-background_zmfqjl' },
      },
    },
  },
  { timestamps: true },
);

//====================================GROUP========================================>>
const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'groups', default: null },
    delay: { type: Number, default: null },
    address: { type: String, default: null },
    activeTime: { type: Array, default: null },
    images: {
      avatar: {
        url: { type: String, default: '' },
        id: { type: String, default: '' },
      },
      wallPaper: {
        url: { type: String, default: '' },
        id: { type: String, default: 'no-background_zmfqjl' },
      },
    },
  },
  { timestamps: true },
);

//====================================ACTIVITY========================================>>
const activitiesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    auth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    code: {
      type: String,
      required: true,
    },
    numTPI: {
      type: Number,
      default: 0,
    },
    listCheckin: [
      {
        id: {
          type: String,
          default: '',
        },
        name: {
          type: String,
          default: 'Không có tên',
        },
        checkinAt: {
          type: Date,
        },
        createAt: {
          type: Date,
        },
        token: {
          type: String,
          required: true,
        },
        ipCheckin: {
          type: String,
        },
        timezone: {
          type: String,
        },
        loc: {
          type: String,
        },
        isChecked: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isHaveFile: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const listSchema = [
  userSchema,
  roleSchema,
  groupSchema,
  productSchema,
  checkInSchema,
  categorySchema,
  oderSchema,
];

//====================================PLUGIN========================================>>
listSchema.forEach(item =>
  item.plugin(mongoose_delete, { overrideMethods: true, deletedAt: true }),
);

//====================================INDEX=========================================>>
listSchema.forEach(item =>
  item.index(
    { deletedAt: 1 },
    { expireAfterSeconds: 2678400, partialFilterExpression: { deleted: true } },
  ),
); // automatically deleted after 90 days since field deleted has value

//====================================MODELS========================================>>
const models = {
  otp: mongoose.model('otp', otpSchema),
  users: mongoose.model('users', userSchema),
  roles: mongoose.model('roles', roleSchema),
  orders: mongoose.model('orders', oderSchema),
  groups: mongoose.model('groups', groupSchema),
  checkIn: mongoose.model('checkIn', checkInSchema),
  features: mongoose.model('features', featureSchema),
  products: mongoose.model('products', productSchema),
  categories: mongoose.model('categories', categorySchema),
  activities: mongoose.model('activities', activitiesSchema),
};

export default models;

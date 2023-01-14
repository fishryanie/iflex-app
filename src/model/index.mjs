/** @format */

// import env from 'dotenv';
import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { EXPIRES_OTP, STATUS_USER } from '../constants/index.mjs';
import { IMAGES } from '../assets/images/index.mjs';

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

const checkinSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'groups' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  },
  { timestamps: true },
);

//====================================USERS========================================>>
const userSchema = new mongoose.Schema(
  {
    gender: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
      maxlength: 32,
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      minlength: 8,
      maxlength: 32,
    },
    password: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    displayName: {
      type: String,
      trim: true,
      default: '',
      maxlength: 32,
    },
    status: {
      type: String,
      trim: true,
      default: STATUS_USER.firstTime,
      maxlength: 32,
    },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'roles', required: true }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'groups', default: null }],
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

//====================================CATEGORY========================================>>
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
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
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    expirationDate: { type: Date, required: true },
    images: {
      avatar: {
        url: { type: String, default: '' },
        id: { type: String, default: '' },
      },
      wallPaper: {
        url: { type: String, default: IMAGES.nullBackground },
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
    delay: {type: Number, default: null},
    images: {
      avatar: {
        url: { type: String, default: '' },
        id: { type: String, default: '' },
      },
      wallPaper: {
        url: { type: String, default: IMAGES.nullBackground },
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
  checkinSchema,
  categorySchema,
  oderSchema,
];

//====================================METHODS========================================>>
userSchema.static('generateJWT', function (userId) {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET_KEY, { expiresIn: '10m' });
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
  otps: mongoose.model('otps', otpSchema),
  users: mongoose.model('users', userSchema),
  roles: mongoose.model('roles', roleSchema),
  oders: mongoose.model('oders', oderSchema),
  groups: mongoose.model('groups', groupSchema),
  checkin: mongoose.model('checkin', checkinSchema),
  features: mongoose.model('features', featureSchema),
  products: mongoose.model('products', productSchema),
  categories: mongoose.model('categories', categorySchema),
  activities: mongoose.model('activities', activitiesSchema),
};

models.users.findOneWithDeleted({ username: '0979955925' }).then(user => {
  if (!user) {
    new models.users({
      displayName: 'moderator',
      phone: '0979955925',
      username: '0979955925',
      password: '2171998Ryanphan@',
    })
      .save()
      .then(() => console.log({ status: true, message: 'create init user successfully' }))
      .catch(err => console.log({ status: false, message: err.message }));
  }
});

export default models;

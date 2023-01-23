/** @format */
import models from '#models';

// import sendSMS from '../configs/twlio';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import moment from 'moment';
import otpGenerator from 'otp-generator';
import { EXPIRES_OTP, NUM_OTP } from '#constants';
import { cloudCreate, cloudDelete } from '../../configs/cloudinary.mjs';
import { generatePassword, notFoundError, serverError } from '../../helpers/index.mjs';

const { TokenExpiredError } = jwt;

const userController = {
  /* This function is used to find one user. */
  findOneUser: async (req, res) => {
    try {
      const userId = req.query.userId || req.currentUser._id;
      const result = await models.users
        .findOne({ _id: userId }, { __v: 0, password: 0 })
        .populate('roles', 'name')
        .populate('groups', 'name');
      if (!result) {
        return notFoundError(res, 'Id user does not exist');
      } else {
        const { images, accessToken, refreshToken, ...other } = result._doc;
        return res.status(200).send({
          success: true,
          message: 'Find User Successfully',
          data: { ...other, avatar: images.avatar.url },
        });
      }
    } catch (error) {
      return error.kind === 'ObjectId'
        ? notFoundError(res, 'Id user does not exist')
        : serverError(error, res);
    }
  },

  /* A function that is used to find many users. */
  findManyUser: async (req, res) => {
    const filter = [{ deleted: false }];
    const roles = req.query.roles;
    const keywords = req.query.keywords;
    const amount = parseInt(req.query.amount) || 10;
    const orderby = parseInt(req.query.orderby) || 1;
    const page = parseInt(req.query.page) || 1;
    const sort = { [req.query.sort]: orderby };
    const skip = (page - 1) * amount;

    if (roles) {
      filter.push({ roles: mongoose.Types.ObjectId(roles) });
    }
    if (keywords) {
      filter.push({
        $or: [
          { displayName: { $regex: '.*' + keywords, $options: 'i' } },
          { phoneNumber: { $regex: '.*' + keywords, $options: 'i' } },
        ],
      });
    }
    try {
      const result = await models.users.aggregate([
        { $match: { $and: filter } },
        {
          $project: {
            displayName: 1,
            email: 1,
            phoneNumber: 1,
            avatar: '$images.avatar.url',
          },
        },
        { $group: { _id: '$root', data: { $push: '$$ROOT' }, total: { $sum: 1 } } },
        { $project: { _id: 0 } },
        {
          $addFields: {
            page: { $toInt: page },
            amount,
            data: { $slice: ['$data', skip, amount] },
            totalPage:
              '$total' % amount === 0
                ? { $divide: ['$total', amount] }
                : { $toInt: { $sum: [{ $divide: ['$total', amount] }, 1] } },
          },
        },
      ]);
      return res.status(200).send(result[0]);
    } catch (error) {
      return res.status(500).send({ success: false, message: error.message });
    }
  },

  /* Deleting a user from the database. */
  deleteOneUser: async (req, res) => {
    try {
      const userId = req.query.userId;
      const result = await models.users.findOneAndDelete({ _id: userId });
      return !result
        ? notFoundError(res, 'Id user does not exist')
        : res.status(200).send({
            success: true,
            message: 'Delete User Successfully',
          });
    } catch (error) {
      return error.kind === 'ObjectId'
        ? notFoundError(res, 'Id user does not exist')
        : serverError(error, res);
    }
  },

  /* A function that is used to delete many users. */
  deleteManyUser: async (req, res) => {
    try {
      const { userId } = req.query;
      if (userId && userId?.length > 0) {
        const result = await models.users.deleteMany({ _id: { $in: userId } });
        if (result?.deletedCount > 0) {
          return res.status(200).send({
            success: true,
            message: 'Delete User Successfully',
          });
        } else {
          return notFoundError(res, 'Id user does not exist');
        }
      } else {
        return res.status(404).send({
          success: false,
          message: 'User Id can not be blank',
        });
      }
    } catch (error) {
      return error.kind === 'ObjectId'
        ? notFoundError(res, 'Id user does not exist')
        : serverError(error, res);
    }
  },

  editProfile: async (req, res) => {
    const { _id } = req.currentUser || req.query;
    try {
      const result = await models.users.findOneAndUpdate({ _id }, req.body, {
        new: true,
        upsert: true,
      });
      if (!result) {
        return notFoundError(res, 'User not found');
      }
      const response = {
        success: true,
        message: 'Updated profile',
      };
      return res.status(200).send(response);
    } catch (error) {
      return error.kind === 'ObjectId'
        ? notFoundError(res, 'Id user does not exist')
        : serverError(error, res);
    }
  },
};

export default userController;

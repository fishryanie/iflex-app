/** @format */

import models from '../model/index.mjs';
// import sendSMS from '../configs/twlio';
import qr from 'qrcode';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import moment from 'moment';
import otpGenerator from 'otp-generator';
import { EXPIRES_OTP, NUM_OTP } from '../constants/index.mjs';
import { cloudCreate, cloudDelete } from '../configs/cloudinary.mjs';
import { generatePassword, notFoundError, serverError } from '../helpers/index.mjs';

const { TokenExpiredError } = jwt;

const authController = {
  login: (req, res) => {
    const { _id } = req.currentUser;
    const accessToken = models.users.generateJWT(_id);
    const refreshToken = models.users.generateRefreshJWT(_id);
    models.users
      .findOneAndUpdate(
        { _id },
        { $set: { refreshToken } },
        { new: true, upsert: true, strict: false, returnNewDocument: true },
      )
      .then(() => {
        return res.status(200).send({
          success: true,
          message: 'Login Successfully',
          data: { accessToken, refreshToken },
        });
      });
  },

  sendOTP: async (req, res) => {
    try {
      const { phone } = req.body;
      const OTP = otpGenerator.generate(NUM_OTP, {
        digits: true,
        alphabets: false,
        upperCase: false,
        specialChars: false,
      });
      // await sendSMS(phone, OTP)
      const salt = await bcrypt.genSalt(10);
      const otp = await bcrypt.hash(OTP, salt);
      const result = await models.otps.create({ phone, otp });
      if (!result) {
        return res.status(400).send({
          success: false,
          message: 'Otp send failure!',
        });
      }
      return res.status(200).send({
        success: true,
        otp: OTP,
        expires: EXPIRES_OTP,
        message: 'Otp send successfully!',
      });
    } catch (err) {
      console.log('🚀 ~ file: auth.js:79 ~ registerOTP: ~ err', err);
    }
  },

  verifyOtp: async (req, res) => {
    try {
      const { phone, otp } = req.body;
      const otpHolder = await models.otps.findOne({ phone });
      if (!otpHolder) {
        return res.status(400).send({
          success: false,
          message: 'You use an Expired OTP!',
        });
      }
      const validUser = await bcrypt.compare(otp, otpHolder.otp);
      const pwd = generatePassword();
      if (otpHolder.phone === phone && validUser) {
        const newUser = new models.users({
          phone,
          username: phone,
          password: pwd,
        });
        await newUser.save();
        await models.otps.deleteMany({
          phone: otpHolder.phone,
        });
        return res.status(200).send({
          success: true,
          message: 'User Registration Successfull!',
        });
      } else {
        return res.status(400).send({
          success: false,
          message: 'Your OTP was wrong!',
        });
      }
    } catch (error) {
      console.log('🚀 ~ file: auth.js:169 ~ verifyOtp: ~ error', error);
    }
  },

  createPwd: async (req, res) => {
    try {
      const { phone, password } = req.body;
      const hashPassword = await models.users.hashPassword(password);
      const result = await models.users.findOneAndUpdate(
        { phone: phone },
        { password: hashPassword },
        { new: true },
      );
      if (!result) {
        return res.status(400).send({
          success: false,
          messages: messages.UpdatePasswordFail,
        });
      }
      return res.status(200).send({
        success: true,
        messages: 'Password generated successfully',
      });
    } catch (error) {}
  },

  forgotPwd: async (req, res) => {
    const { phone, email } = req.body;
    try {
      const newPwd = generatePassword();
      const newPwdHash = await models.users.hashPassword(newPwd);
      if (phone) {
        const result = await models.users.findOneAndUpdate(
          { phone },
          { password: newPwdHash },
          { new: true },
        );
        if (!result) {
          return res.status(404).send({
            success: false,
            message: 'Phone number does not exist',
          });
        }
        return res.status(200).send({
          success: true,
          newPass: newPwd,
          message: 'New password has been sent to your phone number',
        });
      } else {
        const result = await models.users.findOneAndUpdate(
          { email },
          { password: newPwdHash },
          { new: true },
        );
        if (!result) {
          return res.status(404).send({
            success: false,
            message: 'Email does not exist',
          });
        }
        return res.status(200).send({
          success: true,
          newPass: newPwd,
          message: 'Email has been sent to your email',
        });
      }
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  },

  changePwd: async (req, res) => {
    const userId = req.userIsLogged._id.toString();
    const newPass = req.body.newPass;
    try {
      const result = await models.users.findOneAndUpdate(
        { _id: userId },
        { password: await models.users.hashPassword(newPass) },
        { new: true, upsert: true },
      );
      if (!result) {
        return res.status(404).send({
          success: false,
          message: 'Id user does not exist',
        });
      }
      return res.status(200).send({
        success: true,
        message: 'Change Password Successfully!!!',
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const verifyRefreshToken = await models.users.validRefreshJWT(refreshToken);
      if (verifyRefreshToken) {
        const newAccessToken = await models.users.generateJWT(verifyRefreshToken._id);
        const newRefreshToken = await models.users.generateRefreshJWT(verifyRefreshToken._id);
        const result = await models.users.findOneAndUpdate(
          { _id: verifyRefreshToken._id },
          { $set: { refreshToken: newRefreshToken, accessToken: newAccessToken } },
          { upsert: true, new: true, returnNewDocument: true, strict: false },
        );
        if (result) {
          return res.status(200).send({
            success: true,
            message: 'Refresh Token Successfully',
            data: { newAccessToken, newRefreshToken },
          });
        }
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return res.status(440).send({
          success: false,
          message: 'Unauthorized! Refresh token was expired!',
        });
      }
      return serverError(error, res);
    }
  },

  //==========================================|| USER ||==========================================>>
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
        { $project: { displayName: 1, email: 1, phoneNumber: 1, avatar: '$images.avatar.url' } },
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

  uploadAvatar: async (req, res) => {
    try {
      const path = req.files.avatar[0].path;
      const { searchType, groupId } = req.query;
      const { _id } = req.currentUser;
      switch (searchType) {
        case value:
          const { id, url } = await cloudCreate(path, 'user');
          
          break;
      
        default:
          break;
      }
      const result = await models.users.findOneAndUpdate(
        { _id },
        { images: { avatar: { id, url } } },
      );
      if (result) {
        await cloudDelete(result.images.avatar.id);
        const response = {
          success: true,
          message: 'Upload Avatar Successfully',
        };
        return res.status(200).send(response);
      }
    } catch (error) {
      return serverError(error, res);
    }
  },

  //==========================================|| ROLE ||==========================================>>
  findOneRole: async (req, res) => {
    const { id } = req.query;
    try {
      const result = await models.roles.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'features',
            localField: '_id',
            foreignField: 'roles',
            as: 'features',
            pipeline: [
              { $project: { name: 1, group: 1, roles: 1 } },
              { $group: { _id: '$group', data: { $push: '$$ROOT' } } },
            ],
          },
        },
      ]);
      return res.status(200).send({
        success: true,
        result,
      });
    } catch (error) {
      return serverError(error, res);
    }
  },

  findManyRole: async (req, res) => {
    const { keywords, sort = 'name', orderby = 1, page = 1, numshow = 10 } = req.query;
    const search = {
      $match: {
        name: {
          $regex: '.*' + keywords,
          $options: 'i',
        },
      },
    };
    const query = [
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'roles',
          as: 'users',
          pipeline: [
            { $match: { deleted: false } },
            { $limit: 8 },
            { $project: { avatar: '$images.avatar.url' } },
          ],
        },
      },
      { $project: { name: 1, users: 1 } },
      { $skip: (parseInt(page) - 1) * numshow },
      { $limit: parseInt(numshow) },
      { $sort: { [sort]: parseInt(orderby) } },
    ];
    keywords && query.unshift(search);
    try {
      const result = await models.roles.aggregate(query);
      return res.status(200).send({
        page,
        numshow,
        success: true,
        data: result,
      });
    } catch (error) {
      return serverError(error, res);
    }
  },

  insertManyRole: async jsonData => {
    if (jsonData.length <= 0) {
      const response = {
        success: false,
        message: 'Json data can not be blank',
      };
      console.log(response);
      return response;
    }
    models.roles
      .insertMany(jsonData)
      .then(data => {
        const response = {
          data,
          success: true,
          message: 'Insert many ROLES successfully',
        };
        console.log(response);
        return response;
      })
      .catch(err => err.message);
  },

  //========================================|| PERMISSION ||==========================================>>

  findManyFeature: async (req, res) => {
    try {
      const result = await models.features.aggregate([
        { $project: { name: 1, group: 1 } },
        { $group: { _id: '$group', selector: { $push: { _id: '$_id', name: '$name' } } } },
      ]);
      return res.status(200).send({ success: true, data: result });
    } catch (error) {
      return res.status(500).send({ success: false, message: error.message });
    }
  },

  checkActBefUploadFile: async function (req, res, next) {
    let c = req.params.c;
    let i = await services.getActByCode(c, req.user._id);
    if (!i) {
      let m = 'Không tìm thấy hoạt động cần tải file lên.';
      return res.send({ e: m, s: false });
    }
    return next();
  },

  AJAX_postUploadListCheckin: async function (req, res) {
    var c = req.params.c;
    console.log(req.body.fileact + '-file');
    var i = await services.getActByCode(c, req.user._id);
    if (!i) return res.send({ e: 'Không tìm thấy hoạt động cần tải file lên!', s: false });
    await readXlsxFile(`./public/files/xlsx/${c}.xlsx`, { sheet: 'DIEMDANH' }).then(async function (
      rows,
      error,
    ) {
      if (error) {
        console.log('Lỗi đọc file: ' + error);
        return res.send({
          e: 'Dường như có lỗi nào đó đã xảy ra trong quá trình đọc file mà bạn tải lên! Hãy chắc chắn rằng file bản tải lên là đúng trước khi thử lại!',
          s: false,
        });
      }
      await services.updateNumTPIAct(c, rows.length - 1, req.user._id);
      await services.uploadedFileCheckinActById(i._id);
    });
    return res.send({ n: i.name, s: true });
  },

  createQrCode: async function (req, res) {
    const data = {
      _id: '12323adasdjj2b1ekb12',
      name: 'iflexCompany',
    };
    let stJson = JSON.stringify(data);
    qr.toString(stJson, { type: 'terminal' }, (err, code) => {
      if (err) return console.log(err);
      console.log(code);
    });
    qr.toDataURL(stJson, (err, code) => {
      if (err) return console.log(err);
      console.log(code);
    });
  },

  renderListCheckin: async function (req, res) {
    try {
      const result = await models.checkin
        .find({
          createdAt: {
            $gte: moment().startOf('day').toDate(),
            $lt: moment().endOf('day').toDate(),
          },
        })
        .populate(['user', 'group']);
      res.render(process.cwd() + '/views/checkin.ejs', { data: result, moment: moment });
    } catch (error) {
      return res.status(500).send({ success: false, message: error.message });
    }
  },

  checkInWorkout: async (req, res) => {
    const { idUser, idGroup } = req.body;
    try {
      const result = await models.checkin.create({
        user: idUser,
        group: idGroup,
      });
      if (!result) {
        return res.status(400).send({
          success: false,
          message: 'Check in failed',
        });
      }
      return res.status(200).send({
        success: true,
        message: 'checkin successful',
      });
    } catch (error) {
      return serverError(error, res);
    }
  },
};

export default authController;

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
import mongoose from 'mongoose';
import { DATA_LOCATION } from '#mocks';

const { TokenExpiredError } = jwt;

const userController = {
    login: (req, res) => {
        const { _id } = req.currentUser;
        const accessToken = models.users.generateJWT(_id);
        const refreshToken = models.users.generateRefreshJWT(_id);
        models.users.findOneAndUpdate({ _id }, { $set: { refreshToken } }, { new: true, upsert: true, strict: false, returnNewDocument: true }).then(() => {
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
            const result = await models.users.findOneAndUpdate({ phone: phone }, { password: hashPassword }, { new: true });
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
                const result = await models.users.findOneAndUpdate({ phone }, { password: newPwdHash }, { new: true });
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
                const result = await models.users.findOneAndUpdate({ email }, { password: newPwdHash }, { new: true });
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
    /* This function is used to find one user. */
    getUser: async (request, res) => {
        try {
            const idUser = request.query.idUser || request.idUser;
            const result = await models.users
                .findOne({ _id: idUser }, { __v: 0, password: 0, deleted: 0 })
                .populate('roles', 'name')
                .populate('groups', 'name');
            if (!result) {
                return notFoundError(res, 'Id user does not exist');
            } else {
                const { images, accessToken, refreshToken, ...other } = result._doc;
                return res.status(200).send({
                    success: true,
                    message: 'Find User Successfully',
                    data: { ...other, avatar: images?.avatar?.url },
                });
            }
        } catch (error) {
            return error.kind === 'ObjectId' ? notFoundError(res, 'Id user does not exist') : serverError(res, error);
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
        const idUser = req.query.idUser;

        if (roles) {
            filter.push({ roles: mongoose.Types.ObjectId(roles) });
        }
        if (keywords) {
            filter.push({
                $or: [{ displayName: { $regex: '.*' + keywords, $options: 'i' } }, { phoneNumber: { $regex: '.*' + keywords, $options: 'i' } }],
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
                        totalPage: '$total' % amount === 0 ? { $divide: ['$total', amount] } : { $toInt: { $sum: [{ $divide: ['$total', amount] }, 1] } },
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
            return error.kind === 'ObjectId' ? notFoundError(res, 'Id user does not exist') : serverError(error, res);
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
            return error.kind === 'ObjectId' ? notFoundError(res, 'Id user does not exist') : serverError(error, res);
        }
    },

    editProfile: async (req, res) => {
        try {
            const idUser = req.idUser || req.query.idUser;
            const result = await models.users.findOneAndUpdate({ _id: idUser }, req.body, {
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
            return error.kind === 'ObjectId' ? notFoundError(res, 'Id user does not exist') : serverError(error, res);
        }
    },

    locationsUser: async (req, res) => {
        // res.send(req.body);
        try {
            const { editType, idUser } = req.query;
            const { fullAddress, address, compound, latitude, longitude } = req.body;
            let actionValue = {};
            let currentLocation = null;
            switch (editType) {
                case 'save':
                    currentLocation = await models.users.aggregate([
                        { $match: { _id: mongoose.Types.ObjectId(req.idUser || idUser) } },
                        { $project: { numberOfLocation: { $size: '$location' } } },
                    ]);
                    actionValue = {
                        $addToSet: {
                            location: {
                                address,
                                fullAddress,
                                latitude,
                                longitude,
                                isDefault: false,
                                province: {
                                    title: compound.province,
                                    code: DATA_LOCATION.province.find(item => item?.name.toLowerCase().includes(compound?.province?.toLowerCase())).idProvince,
                                },
                                district: {
                                    title: compound.district,
                                    code: DATA_LOCATION.district.find(item => item?.name.toLowerCase().includes(compound?.district?.toLowerCase()))?.idDistrict,
                                },
                                commune: {
                                    title: compound.commune,
                                    code: DATA_LOCATION.ward.find(item => item?.name.toLowerCase().includes(compound?.commune?.toLowerCase())).idWard,
                                },
                            },
                        },
                    };
                    break;
                case 'edit':
                    break;
                case 'delete':
                    actionValue = { $pull: { location: { fullAddress: fullAddress } } };
                    break;
                default:
                    break;
            }
            const result = await models.users.findOneAndUpdate({ _id: req.idUser || idUser }, actionValue, {
                new: true,
                upsert: true,
            });
            if (!result) {
                return notFoundError(res, 'User not found');
            }
            if (currentLocation?.[0]?.numberOfLocation === result.location.length) {
                return res.status(400).send({ success: false, message: 'Address already exists' });
            }
            const response = {
                data: result.location,
                success: true,
                message: 'Updated profile',
            };
            return res.status(200).send(response);
        } catch (error) {
            return error.kind === 'ObjectId' ? notFoundError(res, 'Id user does not exist') : serverError(res, error);
        }
    },
};

export default userController;

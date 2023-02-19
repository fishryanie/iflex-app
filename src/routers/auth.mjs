/** @format */

import mongoose from 'mongoose';

import express from 'express';

import models from '#models';
import moment from 'moment';
import {
  checkPhone,
  verifyPermission,
  verifyPwd,
  verifyToken,
  verifyUsername,
} from '../middlewares/index.mjs';
import upload from '../configs/upload.mjs';
import controllers from '#controllers';
import { STATUS_NEXT } from '#constants';
const router = express.Router();

// router.route('/refreshToken').post(verifyToken, controllers);

router.route('/login').post(verifyUsername, verifyPwd, controllers.user.login);

router.route('/sendOtp').post(checkPhone(STATUS_NEXT.unExist), controllers.user.sendOTP);

router.route('/verifyOtp').post(checkPhone(), controllers.user.verifyOtp);

router.route('/createPass').post(checkPhone(STATUS_NEXT.exist), controllers.user.createPwd);

router.route('/forgotPass').post(checkPhone(STATUS_NEXT.exist), controllers.user.forgotPwd);

router.route('/changePass').post(verifyToken, controllers.user.changePwd);

// router.route('/uploadAvatar').post(verifyToken, authController.uploadAvatar);

router.route('/update-one-user').put(verifyToken, controllers.user.editProfile);

// router.route('/joinGroup').patch(verifyToken, authController.joinGroup);

router.route('/get-one-user').get(
  verifyToken,
  verifyPermission,
  controllers.user.findOneUser
);

router.route('/findManyUser').get(controllers.user.findManyUser);

router.route('/deleteOneUser').delete(controllers.user.deleteOneUser);

router.route('/deleteManyUser').delete(controllers.user.deleteManyUser);

// router.route('/statistics/register/newly').post(authController.statisticsOfNewlyUsers);

// router.route('/findManyRole').get(authController.getManyRole);

// router.route('/findManyFeature').get(authController.findManyFeature);

// router.route('/createQrCode').post(authController.createQrCode);

// router.route('/checkin').get(authController.renderListCheckin);

// router.route('/checkin').post(authController.checkin);

export default router;

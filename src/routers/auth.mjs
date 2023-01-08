/** @format */

import mongoose from 'mongoose';

import express from 'express';

import authController from '../controllers/auth.mjs';

import models from '../model/index.mjs';

import moment from 'moment';
import { checkPhone, verifyPermission, verifyPwd, verifyToken, verifyUsername } from '../middlewares/index.mjs';
import { STATUS_NEXT } from '../constants/index.mjs';
import upload from '../configs/upload.mjs';

const router = express.Router();

router.route('/refreshToken').post(verifyToken, authController.refreshToken);

router.route('/login').post(verifyUsername, verifyPwd, authController.login);

router.route('/sendOtp').post(checkPhone(STATUS_NEXT.unExist), authController.sendOTP);

router.route('/verifyOtp').post(checkPhone(), authController.verifyOtp);

router.route('/createPass').post(checkPhone(STATUS_NEXT.exist), authController.createPwd);

router.route('/forgotPass').post(checkPhone(STATUS_NEXT.exist), authController.forgotPwd);

router.route('/changePass').post(verifyToken, authController.changePwd);

router.route('/uploadAvatar').post(verifyToken, authController.uploadAvatar);

router.route('/editProfile').put(verifyToken, authController.editProfile);

router.route('/findOneUser').get(
  verifyToken,
  verifyPermission,
  authController.findOneUser
);

router.route('/findManyUser').get(authController.findManyUser);

router.route('/deleteOneUser').delete(authController.deleteOneUser);

router.route('/deleteManyUser').delete(authController.deleteManyUser);




// router.route('/statistics/register/newly').post(authController.statisticsOfNewlyUsers);



// router.route('/findManyRole').get(authController.getManyRole);

// router.route('/findManyFeature').get(authController.findManyFeature);

// router.route('/createQrCode').post(authController.createQrCode);

// router.route('/checkin').get(authController.renderListCheckin);

// router.route('/checkin').post(authController.checkin);



export default router;
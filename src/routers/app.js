/** @format */

const authController = require('../controllers/auth.mjs');

const router = require('express').Router();

router.route('/checkin').post(authController.checkin);

module.exports = router;

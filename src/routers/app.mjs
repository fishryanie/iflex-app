/** @format */

import express from 'express';
import controllers from '#controllers';
import { verifyToken } from '../middlewares/index.mjs';

const router = express.Router();

// Groups
router.route('/find-one-group').get(verifyToken, controllers.group.findOneGroup);
router.route('/insert-one-group').post(verifyToken, controllers.group.insertOneGroup);
router.route('/edit-active-time').patch(verifyToken, controllers.group.editActiveTime);
// Check-in
router.route('/check-in').post(verifyToken, controllers.group.checkIn);
router.route('/find-many-check-in-group').get(verifyToken, controllers.group.findManyCheckInGroup);
// Categories
router.route('/find-many-categories').get(controllers.category.findManyCategories);

export default router;

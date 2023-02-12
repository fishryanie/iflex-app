/** @format */

import express from 'express';
import controllers from '#controllers';
import { verifyToken } from '../middlewares/index.mjs';

const router = express.Router();
// App
router.route('/get-configs').get((request, response) => {
  const { type, language } = request.query;
  response.status(200).send({
    success: true,
    message: 'Successfully',
    data: type === 'terms-policy' ? controllers.app.getPolicyAndTerms(language) : null,
  });
});

// Shared
router.route('/get-location').get((request, response) => {
  const { type, idProvince, idDistrict } = request.query;
  response.status(200).send({
    success: true,
    message: 'Successfully',
    data:
      type === 'province'
        ? controllers.location.getProvince()
        : type === 'district'
        ? controllers.location.getDistrict(idProvince)
        : type === 'ward'
        ? controllers.location.getWard(idDistrict)
        : [],
  });
});

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

/** @format */

import mongoose from 'mongoose';

import express from 'express';

import models from '../model/index.mjs';
import { serverError } from '../helpers/index.mjs';

const router = express.Router();

router.route('/insert-one-group').post(async (req, res) => {
  try {
    const checkExists = await models.groups.findOne({ name: req.body.name });
    if (checkExists) {
      return res.status(400).send({ success: false, message: 'Group name already used' });
    }
    const newGroup = await models.groups.create(req.body);
    if (!newGroup) {
      return res.status(400).send({ success: false, message: 'insert new group failed' });
    }
    return res.status(200).send({ success: true, message: 'insert new group successfully' });
  } catch (error) {
    return serverError(error, res);
  }
});

router.route('/getGroup').post((req, res) => {});

export default router;

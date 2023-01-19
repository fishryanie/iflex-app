/** @format */

import mongoose from 'mongoose';

import express from 'express';

import models from '#models';
import { notFoundError, responseSusses, serverError } from '../helpers/index.mjs';
import { verifyToken } from '../middlewares/index.mjs';

const router = express.Router();

router.route('/insert-one-group').post(verifyToken, async (req, res) => {
  try {
    const checkExists = await models.groups.findOne({
      name: req.body.name,
      creator: req.currentUser,
    });
    if (checkExists) {
      return responseFailed(res, 'Group name already used');
    }
    const newGroup = await models.groups.create({
      creator: req.currentUser,
      ...req.body,
    });
    if (!newGroup) {
      return responseFailed(res, 'Insert new group failed');
    }
    models.users.findOneAndUpdate(
      { _id: req.currentUser },
      { $addToSet: { groups: newGroup._id } },
      { new: true },
    );
    return responseSusses(res, newGroup);
  } catch (error) {
    return error.kind === 'ObjectId'
      ? notFoundError(res, 'Id user does not exist')
      : serverError(error, res);
  }
});

router.route('/find-one-group').get(verifyToken, async (req, res) => {
  const query = [
    { $match: { _id: mongoose.Types.ObjectId(req.query.groupId), deleted: false } },
    { $project: { name: 1, delay: 1, image: '$images.avatar.url' } },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'groups',
        as: 'members',
        pipeline: [
          { $match: { deleted: false } },
          { $project: { avatar: '$images.avatar.url' } },
          { $sort: { createdAt: 1 } },
          { $limit: 5 },
        ],
      },
    },
  ];
  try {
    const result = await models.groups.aggregate(query);
    return responseSusses(res, result);
  } catch (error) {
    return serverError(error, res);
  }
});

router.route('/find-many-category').get(async (req, res) => {
  const {
    keywords,
    sort = 'name',
    orderby = 1,
    page = 1,
    numShow = 10,
    parent,
  } = req.query;
  const filter = { deleted: false };
  if (keywords) {
    filter['name'] = {
      $regex: '.*' + keywords,
      $options: 'i',
    };
  }
  if (parent) {
    filter['parent'] = mongoose.Types.ObjectId(parent);
  }
  const query = [
    { $match: filter },
    { $project: { name: 1, image: '$images.avatar.url' } },
    { $skip: (parseInt(page) - 1) * numShow },
    { $limit: parseInt(numShow) },
    { $sort: { [sort]: parseInt(orderby) } },
  ];
  try {
    const result = await models.categories.aggregate(query);
    return res.status(200).send({
      page,
      numShow,
      success: true,
      message: 'Thành công',
      data: result,
    });
  } catch (error) {
    return serverError(error, res);
  }
});

export default router;

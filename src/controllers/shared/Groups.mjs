/** @format */

import models from '#models';
import mongoose from 'mongoose';
import { responseSusses } from '#helpers';

const groupController = {
  //  Finding a group by id and returning the group name, delay, image, and members.
  findOneGroup: async (request, response) => {
    const query = [
      { $match: { _id: mongoose.Types.ObjectId(request.query.groupId), deleted: false } },
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
      return responseSusses(response, result);
    } catch (error) {
      return serverError(response, error);
    }
  },

  // Finding all the groups that have a parent of null.
  findManyGroup: async (request, response) => {
    const { parent } = request.query;
    const { query, filter } = Pagination(request);
    const idParent = mongoose.Types.ObjectId(parent);
    if (parent) {
      filter['parent'] = idParent;
    } else {
      filter['parent'] = null;
    }
    query.splice(
      2,
      0,
      { $project: { name: 1, delay: 1, image: '$images.avatar.url' } },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator',
          pipeline: [
            { $match: { deleted: false } },
            { $project: { displayName: 1, avatar: '$images.avatar.url' } },
          ],
        },
      },
    );
    try {
      const result = await models.groups.aggregate(query);
      return response.status(200).send(result[0]);
    } catch (error) {
      return serverError(response, error);
    }
  },

  // 1. It is checking if the group name already exists.
  // 2. If it does not exist, it creates a new group.
  // 3. It adds the new group to the user's groups.
  insertOneGroup: async (request, response) => {
    try {
      const checkExists = await models.groups.findOne({
        name: request.body.name,
        creator: request.currentUser,
      });
      if (checkExists) {
        return responseFailed(response, 'Group name already used');
      }
      const newGroup = await models.groups.create({
        creator: request.currentUser,
        ...request.body,
      });
      if (!newGroup) {
        return responseFailed(res, 'Insert new group failed');
      }
      models.users.findOneAndUpdate(
        { _id: request.currentUser },
        { $addToSet: { groups: newGroup._id } },
        { new: true },
      );
      return responseSusses(response, newGroup);
    } catch (error) {
      return error.kind === 'ObjectId'
        ? notFoundError(response, 'Id user does not exist')
        : serverError(response, error);
    }
  },

  // Creating a new checkIn.
  checkIn: async (request, response) => {
    try {
      const { idGroup, latitude, longitude, tokenDevice } = request.body;
      const result = await models.checkIn.create({
        user: request.idUser,
        group: idGroup,
      });
      result && responseSusses(response, result);
    } catch (error) {
      return error.kind === 'ObjectId'
        ? notFoundError(response, 'Id user does not exist')
        : serverError(response, error);
    }
  },

  findManyCheckInGroup: async (request, response) => {
    const { startTime, endTime } = request.query;
    const { query, filter } = pagination(request);
    if ((startTime, endTime)) {
      filter['createdAt'] = { $gte: startTime, $lt: endTime };
    }
    try {
      const result = await models.groups.aggregate(query);
      return response.status(200).send(result[0]);
    } catch (error) {
      return serverError(response, error);
    }
  },

  editActiveTime: async (request, response) => {
    try {
    } catch (error) {
      return serverError(response, error);
    }
  },
};

export default groupController;

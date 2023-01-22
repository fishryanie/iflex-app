/** @format */

import models from "#models";
import mongoose from "mongoose";
import { Pagination, serverError } from "#helpers";

const categoriesController = {
  // A function that is used to find many categories.
  findManyCategories: async (request, response) => {
    const { parent } = request.query;
    const { query, filter } = Pagination(request);
    const idParent = mongoose.Types.ObjectId(parent);
    if (parent) {
      filter['parent'] = idParent;
    } else {
      filter['parent'] = null;
    }
    query.splice(2, 0, {
      $project: { name: 1, image: '$images.avatar.url' },
    });
    try {
      const result = await models.categories.aggregate(query);
      return response.status(200).send(result[0]);
    } catch (error) {
      return serverError(response, error);
    }
  },
};

export default categoriesController;
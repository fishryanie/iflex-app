const models = require("../model");

module.exports = {
  getOneRole: async (req, res) => {
    const { id } = req.query;
    try {
      const result = await models.roles.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'features',
            localField: '_id',
            foreignField: 'roles',
            as: 'features',
            pipeline: [
              { $project: { name: 1, group: 1, roles: 1 } },
              { $group: { _id: '$group', data: { $push: '$$ROOT' } } },
            ],
          },
        },
      ]);
      return res.status(200).send({
        success: true,
        result,
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        error,
      });
    }
  },

  getManyRole: async (req, res) => {
    const { keywords, sort = 'name', orderby = 1, page = 1, numshow = 10 } = req.query;
    const search = {
      $match: {
        name: {
          $regex: '.*' + keywords,
          $options: 'i',
        },
      },
    };
    const query = [
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'roles',
          as: 'users',
          pipeline: [
            { $match: { deleted: false } },
            { $limit: 8 },
            { $project: { avatar: '$images.avatar.url' } },
          ],
        },
      },
      { $project: { name: 1, users: 1 } },
      { $skip: (parseInt(page) - 1) * numshow },
      { $limit: parseInt(numshow) },
      { $sort: { [sort]: parseInt(orderby) } },
    ];
    keywords && query.unshift(search);
    try {
      const result = await models.roles.aggregate(query);
      return res.status(200).send({
        page,
        numshow,
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        error,
      });
    }
  },
}
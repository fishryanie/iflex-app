/** @format */

import { DATA_LOCATION } from '#mocks';
import models from '#models';

const locationController = {
  getProvince: () => {
    return DATA_LOCATION.province;
  },
  getDistrict: idProvince => {
    return idProvince
      ? DATA_LOCATION.district.filter(item => item.idProvince === idProvince)
      : DATA_LOCATION.district;
  },
  getWard: idDistrict => {
    return idDistrict
      ? DATA_LOCATION.ward.filter(item => item.idDistrict === idDistrict)
      : DATA_LOCATION.ward;
  },
  getSavedAddressByUser: async (request, response) => {
    try {
      const { idUser } = request.query;
      const results = await models.users.findOne({
        _id: idUser,
        locationList: 1,
      });
      if (results) {
        return response.status(200).send({
          success: true,
          message: 'Successfully',
          data: results,
        });
      }
    } catch (error) {
      return error.kind === 'ObjectId'
        ? notFoundError(res, 'Id user does not exist')
        : serverError(error, res);
    }
  },
  userSaveAddress: async (request, response) => {
    // body: longitude, latitude, idProvince, idDistrict, idWard, isDefault, address, fullAddress, title
    try {
      const locationList = await User.findOne({ _id: request.idUser }, { locationList: 1 });
      if (locationList.length === 0) {
        return res.status(400).json({ error: 'Danh sách vị trí là rỗng.' });
      }
      const results = await models.users.findOneAndUpdate(
        { _id: request.idUser },
        {
          'profile.address': request.body.fullAddress,
          $push: {
            locationList:
              locationList.length === 0 ? { isDefault: true, ...request.body } : request.body,
          },
        },
        { new: true },
      );
      if (results) {
        return response.status(200).send({
          success: true,
          message: 'Saved address successfully',
          data: results,
        });
      }
    } catch (error) {
      return error.kind === 'ObjectId'
        ? notFoundError(res, 'Id user does not exist')
        : serverError(error, res);
    }
  },
  useUpdateAddress: async (request, response) => {},
  userDeleteAddress: async (request, response) => {},
};

export default locationController;

/** @format */

import env from 'dotenv';
import { v2 as cloudinary } from 'cloudinary'

env.config();

const folderUser = { folder: 'iflex/users/avatar' };
const folderGroup = { folder: 'iflex/users/avatar' };
const folderProduct = { folder: 'iflex/users/avatar' };

cloudinary.config({
  cloud_name: process.env.IFLEX_CLOUD_NAME,
  api_key: process.env.IFLEX_CLOUDINARY_API_KEY,
  api_secret: process.env.IFLEX_CLOUDINARY_API_SECRET,
  secure: process.env.IFLEX_CLOUDINARY_SECURE,
});

export const cloudDelete = async idImage => {
  const response = await cloudinary.uploader.destroy(idImage);
  switch (response.result) {
    case 'ok': {
      const response = {
        success: true,
        message: 'DELETE SUCCESSFULLY IMAGE WITH ID ' + idImage
      }
      console.log(response)
      return response;
    }
    case 'not found': {
      const response = {
        success: false,
        message: 'NOT FOUND IMAGE WITH ID ' + idImage
      };
      console.log(response)
      return response;
    }
    default:
      break;
  }
};

export const cloudCreate = async (pathFile, collection) => {
  let folder;
  switch (collection) {
    case 'users':
      folder = folderUser;
      break;
    case 'group':
      folder = folderGroup;
      break;
    case 'products':
      folder = folderProduct;
      break;
    default:
      break;
  }
  const response = await cloudinary.uploader.upload(pathFile, folder);
  if (response) {
    console.log(response)
    return {
      success: true,
      id: response.public_id,
      url: response.secure_url,
      message: 'Upload successful',
    };
  }
};

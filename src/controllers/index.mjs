import appController from './app/index.mjs';
import userController from './auth/Users.mjs';
import categoriesController from './Shared/Categories.mjs';
import groupController from './Shared/Groups.mjs';
import locationController from './Shared/Location.mjs';

const controllers = {
  app: appController,
  user: userController,
  group: groupController,
  location: locationController,
  category: categoriesController,
};
export default controllers;

import appController from './app/index.mjs';
import userController from './auth/Users.mjs';
import categoriesController from './shared/Categories.mjs';
import groupController from './shared/Groups.mjs';
import locationController from './shared/Location.mjs';

const controllers = {
  app: appController,
  user: userController,
  group: groupController,
  location: locationController,
  category: categoriesController,
};
export default controllers;

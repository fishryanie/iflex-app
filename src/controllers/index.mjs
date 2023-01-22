import userController from "./Auth/Users.mjs";
import categoriesController from './Shared/Categories.mjs'
import groupController from "./Shared/Groups.mjs";


const controllers = {
  user: userController,
  group: groupController,
  category: categoriesController,
}
export default controllers

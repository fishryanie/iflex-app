/** @format */

import chalk from 'chalk';
import models from '#models';
import { DATA_ROLES, DATA_USERS, DATA_CATEGORIES, DATA_FEATURES } from '#mocks';
const termination = chalk.bold.magenta;

export default function InsetFakeData() {
  Promise.all([
    models.roles.deleteMany(),
    models.users.deleteMany(),
    models.features.deleteMany(),
    models.categories.deleteMany(),
  ]).then(async () => {
    Promise.all([
      models.roles.insertMany(DATA_ROLES),
      models.categories.insertMany(DATA_CATEGORIES.slice(0, 50)),
    ]).then(data => {
      LogMessage(data[0], 'ROLES');
      LogMessage(data[1], 'CATEGORIES');
      Promise.all([
        insert_many_user(data[0]),
        insert_many_features(data[0]),
        insert_many_child_categories(data[1]),
      ]).then(data => {
        LogMessage(data[0], 'USERS');
        LogMessage(data[1], 'FEATURES');
        LogMessage(data[2], 'CATEGORIES_CHILD');
      });
    });
  });
}

async function insert_many_features(arrayRoles) {
  return await models.features.insertMany(
    DATA_FEATURES.filter(feature => {
      for (const x in feature.roles) {
        for (const y in arrayRoles) {
          if (feature.roles[x] === arrayRoles[y].name) {
            feature.roles[x] = arrayRoles[y]._id;
          }
        }
      }
    }),
  );
}

async function insert_many_user(arrayRoles) {
  const arrayUsers = [];
  for (const user of DATA_USERS) {
    for (const x in arrayRoles) {
      for (const y in user.roles) {
        if (user.roles[y] === arrayRoles[x].name) {
          user.roles[y] = arrayRoles[x]._id;
        }
      }
    }
    arrayUsers.push(await new models.users({ ...user }).save());
  }
  return arrayUsers;
}

async function insert_many_child_categories(arrayCategories) {
  const results = DATA_CATEGORIES.slice(50, 100).filter(categoryChild => {
    arrayCategories.forEach(categoryParent => {
      categoryChild.parent = categoryParent._id;
    });
    return categoryChild;
  });
  return await models.categories.insertMany(results);
}

const LogMessage = (data, title) => {
  return console.log(
    termination(`InsertMany ${title} successfully ${data?.length} data`),
  );
};

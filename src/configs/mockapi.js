/** @format */

const fs = require('fs');
const qr = require('qrcode');

const mongoose = require('mongoose');

const models = require('../model');

const mock = {
  users: require('../mock/users.json'),
  roles: require('../mock/roles.json'),
  groups: require('../mock/group.json'),
  checkin: require('../mock/checkin.json'),
  features: require('../mock/features.json'),
};

const { randomDate, randomArray, randomInteger } = require('./app');

const formatData = async () => {
  Promise.all([
    models.users.deleteMany(),
    models.roles.deleteMany(),
    models.groups.deleteMany(),
    models.features.deleteMany(),
  ])
    .then(async response => {
      const arrayRoles = await models.roles.insertMany(mock.roles);

      const arrayUsers = await insert_many_user(arrayRoles);

      const arrayGroups = await insert_many_group(arrayUsers);

      const arrayFeatures = await insert_many_features(arrayRoles);

      const arrayCheckin = await insert_many_checkin(arrayUsers, arrayGroups);

      await update_createAt_users(arrayUsers);

      await update_user_groups(arrayUsers, arrayGroups);

      await update_groups(arrayGroups);

      if (arrayRoles && arrayUsers && arrayFeatures) {
        const messages = {
          arrayRoles: `insertMany roles successfully ${arrayRoles.length} data`,
          arrayUsers: `insertMany users successfully ${arrayUsers.length} data`,
          arrayGroups: `insertMany groups successfully ${arrayGroups.length} data`,
          arrayCheckin: `insertMany checkin successfully ${arrayCheckin.length} data`,
          arrayFeatures: `insertMany features successfully ${arrayFeatures.length} data`,
        };
        console.log(messages);
      }
    })
    .catch(error => console.error(error));
};

module.exports = formatData;

/** =======================||FUNCTIONS INSERT SAMPLE DATA ||=============================*/

async function insert_many_user(arrayRoles) {
  const arrayUsers = [];
  for (const user of mock.users) {
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

async function insert_many_group(arrayUsers) {
  mock.groups.forEach(group => {
    arrayUsers.forEach(user => {
      if (group.creator === user.email) {
        group.creator = user._id;
      }
    });
  });
  return await models.groups.insertMany(mock.groups);
}

async function insert_many_features(arrayRoles) {
  mock.features.forEach(feature => {
    for (const x in feature.roles) {
      for (const y in arrayRoles) {
        if (feature.roles[x] === arrayRoles[y].name) {
          feature.roles[x] = arrayRoles[y]._id;
        }
      }
    }
  });
  return await models.features.insertMany(mock.features);
}

async function insert_many_checkin(arrayUsers, arrayGroups) {
  mock.checkin.forEach(checkin => {
    arrayUsers.forEach(user => {
      if (checkin.user === user.email) {
        checkin.user = user._id;
      }
    });
    arrayGroups.forEach(group => {
      if (checkin.group === group.name) {
        checkin.group = group._id;
      }
    });
  });
  return await models.checkin.insertMany(mock.checkin);
}

/** =======================||FUNCTIONS FORMAT UPDATE SAMPLE DATA ||=============================*/

async function update_createAt_users(arrayUsers) {
  arrayUsers.forEach(async user => {
    await models.users.updateOne(
      { _id: user._id },
      { createAt: randomDate(new Date(2018, 0, 0), new Date()) },
      { new: true },
    );
  });
}

async function update_user_groups(arrayUsers, arrayGroups) {
  arrayUsers.forEach(async user => {
    await models.users.updateOne(
      { _id: user._id },
      {
        groups: Array.from(
          new Set(
            randomArray(arrayGroups, (arrayGroups.length * randomInteger(10, 90)) / 100),
          ),
        ).map(item => item._id),
      },
      { new: true },
    );
  });
}

async function update_groups(arrayGroups) {
  arrayGroups.forEach(group => {
    let stJson = JSON.stringify(group._id);
    qr.toDataURL(stJson, async (err, code) => {
      if (err) return console.log(err);
      await models.groups.updateOne({ _id: group._id }, { qrcode: code }, { new: true });
    });
  });
}

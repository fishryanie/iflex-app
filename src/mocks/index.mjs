/** @format */

import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export const DATA_LOCATION = require('./data/location.json');
console.log('🚀 ~ file: index.mjs:8 ~ DATA_LOCATION', DATA_LOCATION.province);

export const DATA_ROLES = require('./data/roles.json');

export const DATA_USERS = require('./data/users.json');

export const DATA_GROUPS = require('./data/groups.json');

export const DATA_FEATURES = require('./data/features.json');

export const DATA_CATEGORIES = require('./data/categories.json');

/** @format */

import env from 'dotenv';
import chalk from 'chalk';
import mongoose from 'mongoose';

env.config();

mongoose.Promise = global.Promise;

const connected = chalk.bold.cyanBright;

const colorError = chalk.bold.redBright;

const mongooseUrlLocal = process.env.IFLEX_DATABASE_URL_LOCAL + process.env.IFLEX_DATABASE_NAME;

const mongooseUrlGlobal = `mongodb+srv://${process.env.IFLEX_DATABASE_USERNAME}:${process.env.IFLEX_DATABASE_PASSWORD}@cluster0.lqsyp.mongodb.net/${process.env.IFLEX_DATABASE_NAME}?retryWrites=true&w=majority`;

const configsMongodb = {
  url: mongooseUrlGlobal,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    serverSelectionTimeoutMS: 10000,
  },
};

const database = () => {
  mongoose
    .connect(configsMongodb.url, configsMongodb.options)
    .then(() => console.log(connected('Mongoose connect success')))
    .catch(() => console.log(colorError('Mongoose connect error')));
};

export default database;

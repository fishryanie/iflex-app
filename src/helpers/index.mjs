/** @format */

import moment from 'moment';
import chalk from 'chalk';
const connected = chalk.bold.cyan;
const colorWarning = chalk.bold.yellow;
const colorError = chalk.bold.redBright;
const termination = chalk.bold.magenta;

export const URLToTile = url => {
  return url.substr(1).replaceAll('-', ' ').toUpperCase();
};

export const percentage = (totalValue, partialValue) => {
  let result = (100 * partialValue) / totalValue;
  return result.toFixed(2);
};

export const getTimeStatistic = (time, range = 1) => {
  const timeEnd = moment().subtract(range, time).endOf(time).format('LLLL');
  const timeStart = moment().subtract(range, time).startOf(time).format('LLLL');
  return { timeStart, timeEnd };
};

export const compareWithLastTime = (lastTime, currentTime) => {
  if (currentTime > lastTime) {
    return `${percentage(lastTime, currentTime)} %`;
  } else {
    return `-${percentage(lastTime, currentTime)} %`;
  }
};

export const generatePassword = (length = 16) => {
  // password will be @Param-length, default to 8, and have at least one upper, one lower, one number and one symbol
  let pwd = '';
  const allowed = {
    uppers: 'QWERTYUIOPASDFGHJKLZXCVBNM',
    lowers: 'qwertyuiopasdfghjklzxcvbnm',
    numbers: '1234567890',
    symbols: '!@#$%^&*',
  };
  const getRandomCharFromString = str =>
    str.charAt(Math.floor(Math.random() * str.length));
  pwd += getRandomCharFromString(allowed.uppers); //pwd will have at least one upper
  pwd += getRandomCharFromString(allowed.lowers); //pwd will have at least one lower
  pwd += getRandomCharFromString(allowed.numbers); //pwd will have at least one number
  pwd += getRandomCharFromString(allowed.symbols); //pwd will have at least one symbolo
  for (let i = pwd.length; i < length; i++)
    pwd += getRandomCharFromString(Object.values(allowed).join('')); //fill the rest of the pwd with random characters
  return pwd;
};

export const responseFailure = (res, message, ...params) => {
  return res.status(400).send({ success: false, message: message });
};

export const responseSusses = (res, data, ...params) => {
  return res.status(200).send({ success: true, message: 'Thành công', data });
};

export const notFoundError = (res, message) => {
  return res.status(404).send({
    success: false,
    message: message,
  });
};

export const serverError = (res, error) => {
  return res.status(500).send({
    success: false,
    message: error.message,
  });
};


export const Pagination = request => {
  const keywords = request.query.keywords;
  const numShow = parseInt(request.query.numShow) || 10;
  const orderby = parseInt(request.query.orderby) || 1;
  const page = parseInt(request.query.page) || 1;
  const sort = { [request.query.sort]: orderby };
  const skip = (page - 1) * numShow;
  const filter = { deleted: false };
  if (keywords) {
    filter['name'] = { $regex: '.*' + keywords, $options: 'i' };
  }
  const query = [
    { $match: filter },
    { $sort: sort },
    { $group: { _id: '$root', data: { $push: '$$ROOT' }, total: { $sum: 1 } } },
    { $project: { _id: 0 } },
    {
      $addFields: {
        page,
        numShow,
        data: { $slice: ['$data', skip, numShow] },
        totalPage:
          '$total' % numShow === 0
            ? { $divide: ['$total', numShow] }
            : { $toInt: { $sum: [{ $divide: ['$total', numShow] }, 0] } },
      },
    },
  ];
  return { query, filter };
};

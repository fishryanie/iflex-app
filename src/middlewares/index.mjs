/** @format */

import jwt from 'jsonwebtoken';
import models from '#models';
import { REGEX_PHONE, STATUS_NEXT } from '../constants/index.mjs';
import { notFoundError, serverError, URLToTile } from '../helpers/index.mjs';
const { TokenExpiredError } = jwt;

export const checkPhone = type => async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(404).send({
        success: false,
        message: 'Phone number cannot be blank',
      });
    }
    const validate = phone.match(REGEX_PHONE);
    if (!validate) {
      return res.status(400).send({
        success: false,
        message: 'Phone Number Wrong Format',
      });
    }
    const user = await models.users.findOne({ phone });
    if (type === STATUS_NEXT.exist) {
      if (!user) {
        return res.status(400).send({
          success: false,
          message: 'Phone number does not exist',
        });
      }
      req.currentUser = user;
      return next();
    } else if (type === STATUS_NEXT.unExist) {
      if (user) {
        return res.status(400).send({
          success: false,
          message: 'Phone number already registered!',
        });
      }
      return next();
    } else {
      return next();
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

export const verifyUsername = async (req, res, next) => {
  try {
    const { username } = req.body;
    const result = await models.users.findOne({ username });
    if (!result) {
      return res.status(400).send({
        success: false,
        message: 'Username does not exist',
      });
    }
    req.currentUser = result;
    return next();
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

export const verifyPwd = async (req, res, next) => {
  try {
    const result = await models.users.validPassword(req.body.password, req.currentUser.password);
    if (!result) {
      return res.status(400).send({
        success: false,
        message: 'Wrong password',
      });
    }
    return next();
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

export const verifyToken = async (req, res, next) => {
  const access_token = req.headers['authorization'];
  if (!access_token) {
    return res.status(401).send({
      success: false,
      message: 'Access denied! no token provided.',
    });
  }
  const splitToken = access_token.split(' ');
  if (splitToken.length !== 2) {
    return res.status(401).send({
      success: false,
      message: 'Access denied! invalid token.',
    });
  }
  const token = splitToken[1];
  try {
    const decoded = await models.users.validJWT(token);
    if (decoded && req.body.refreshToken) {
      return res.status(401).send({
        success: false,
        message: 'Access denied! token has not expired',
      });
    }
    req.currentUser = decoded;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      if (req.body.refreshToken) {
        return next();
      }
      return res.status(440).send({
        success: false,
        message: 'Unauthorized! Access Token was expired!',
      });
    }
    return res.status(500).send({
      success: false,
      message: 'Unauthorized! ' + error.message,
    });
  }
};

export const verifyPermission = async (req, res, next) => {
  try {
    const features = await models.features.findOne({ api: req.api });
    if (!features) {
      const createNewFeature = await models.features.create({
        name: URLToTile(req.url),
        url: req.url,
      });
      if (createNewFeature) {
        return res.status(403).send({
          success: false,
          message: "Access denied! You don't have permission",
        });
      }
    }
    const userIsLogged = await models.users.findById(req.currentUser._id, {
      __v: 0,
      password: 0,
      accessToken: 0,
      refreshToken: 0,
    });
    const intersection = features.roles.filter(
      element => userIsLogged.roles.indexOf(element) !== -1,
    );
    if (!intersection.length) {
      return res.status(403).send({
        success: false,
        message: "Access denied! You don't have permission",
      });
    }
    next();
  } catch (error) {
    return error.kind === 'ObjectId'
      ? notFoundError(res, 'Id user does not exist')
      : serverError(error, res);
  }
};

/** @format */

import env from 'dotenv';
import path from 'path';
import cors from 'cors';
import chalk from 'chalk';
import morgan from 'morgan';
import express from 'express';
import cookies from 'cookie-parser';
import createError from 'http-errors';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import routersApp from './src/routers/app.mjs';
import routersAuth from './src/routers/auth.mjs';
import database from './src/configs/database.mjs';
import upload from './src/configs/upload.mjs';


const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

database();

env.config();

app.use(cors());
app.use(cookies());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(upload.fields([
  { name: 'images', maxCount: 2 },
  { name: 'avatar', maxCount: 2 }
])); 

app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, 'src', 'views' , 'introduce.html'));
});
app.get('/document', (req, res) => {
  return res.sendFile(path.join(__dirname, 'src', 'views' , 'document.html'));
});

app.get('/api/v1/configs-app', (req, res) => res.send({success: true}))
app.use('/api/v1/auth', routersAuth);
app.use('/api/v1/app', routersApp);

app.use((req, res, next) => next(createError(404, 'NOT FOUND API')));

// app.get('/scan', (req, res) => res.render('scan'));
// app.get('/qrcode', (req, res) => res.render('qrcode'));


if (process.env.NODE_ENV !== 'test') {
  app.listen(process.env.PORT || 8000, () => {
    console.log(process.version);
    console.log(chalk.bold.cyanBright('Server is running on port ' + process.env.PORT || 8000));
  });
}
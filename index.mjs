/** @format */

import env from 'dotenv';
import cors from 'cors';
import chalk from 'chalk';
import morgan from 'morgan';
import express from 'express';
import cookies from 'cookie-parser';
import createError from 'http-errors';
// import formatData from './src/configs/mockapi';
// import routersApp from './src/routers/auth.mjs';
import routersAuth from './src/routers/auth.mjs';
import database from './src/configs/database.mjs';
import { fakeRole } from './src/mock/index.mjs';
import upload from './src/configs/upload.mjs';

const app = express();

env.config();

database()
fakeRole()


app.use(cors());
app.use(cookies());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.use('/api/v1/auth', routersAuth);

app.use((req, res, next) => next(createError(404)));




// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.get('/', (req, res) => res.render('index'));
// app.get('/scan', (req, res) => res.render('scan'));
// app.get('/qrcode', (req, res) => res.render('qrcode'));



  

if (process.env.NODE_ENV !== 'test') {
  app.listen(process.env.PORT || 8000, () => {
    console.log(chalk.bold.cyanBright('Server is running on port ' + process.env.PORT || 8000));
  });
}

//how to upload image to google drive using nodejs mongodb?

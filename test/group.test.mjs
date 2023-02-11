/** @format */

import app from '../index.mjs';
import env from 'dotenv';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';

env.config();

chai.use(chaiHttp);

const should = chai.should();

const mongooseUrlLocal =
  process.env.IFLEX_DATABASE_URL_LOCAL + process.env.IFLEX_DATABASE_NAME;


describe('My MongoDB tests', function () {
  const GroupTest = mongoose.model('groupTest', new mongoose.Schema({ name: String }));
  const data = [
    {
      _id: '63de879d8d02c3eff94f919e',
      name: 'William Gonzalez',
    },
    {
      _id: '63de879d4a89bec898166a0e',
      name: 'Adele Mcconnell',
    },
    {
      _id: '63de879d87ce33ff9b9e7de3',
      name: 'Sharron Cleveland',
    },
    {
      _id: '63de879dcdf8fbf0a2de8b23',
      name: 'Rose Ayers',
    },
    {
      _id: '63de879dae9901b2db702516',
      name: 'Finley Calhoun',
    },
    {
      _id: '63de879d2f5149a042c06b03',
      name: 'Casey Ratliff',
    },
    {
      _id: '63de879d4177390eb5aeae00',
      name: 'Maude Walls',
    },
  ];
  before(function (done) {
    mongoose.connect(
      'mongodb://localhost:27017/iflex',
      { useNewUrlParser: true, serverSelectionTimeoutMS: 30000 },
      function (err) {
        if (err) return done(err);
        GroupTest.deleteMany({}, function (err) {
          if (err) return done(err);
          done();
        });
      },
    );
  });

  beforeEach(function (done) {
    GroupTest.insertMany(data, function (err) {
      if (err) return done(err);
      done();
    });
  });

  it('Should return success and data when get a group by id', function(done){
    this.timeout(30000); 
    chai
      .request(app)
      .get(`/api/v1/app/find-one-group?groupId=${data[0]._id}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.success.should.be.true;
        res.body.message.should.be.equal('Thành công');
        res.body.data.should.be.a('array');
        done();
      });
  });
});

// describe('Find One Group API', () => {
//   it('Should return success and data when get a group by id', done => {
//     chai
//       .request(app)
//       .get(`/api/v1/app/find-one-group?groupId=${groupId}`)
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.be.a('object');
//         res.body.success.should.be.true;
//         res.body.message.should.be.equal('Thành công');
//         res.body.data.should.be.a('array');
//         done();
//       });
//   });

//   it('Should return not found error when groupId is invalid', done => {
//     chai
//       .request(app)
//       .get('/api/v1/app/find-one-group?groupId=invalidId')
//       .end((err, res) => {
//         res.should.have.status(404);
//         res.body.should.be.a('object');
//         res.body.success.should.be.false;
//         res.body.message.should.be.equal('Not Found ID invalidId');
//         done();
//       });
//   });

//   it('Should return internal server error when get group by id failed', done => {
//     chai
//       .request(app)
//       .get('/api/v1/app/find-one-group?groupId=errorId')
//       .end((err, res) => {
//         res.should.have.status(500);
//         res.body.should.be.a('object');
//         res.body.success.should.be.false;
//         res.body.message.should.be.equal('Internal server error');
//         done();
//       });
//   });
// });

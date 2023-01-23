const chaiHttp = require('chai-http');
const chai = require('chai');
const app = require('../../index.mjs')
const expect = chai.expect;

chai.use(chaiHttp);

describe('Route: Auth', () => {
  describe('GET', () => {
    describe('Get all role', () => {
      const APIFindMany = '/api/user/findManyRole'
      it('Should return 200 if successful', done => {
        chai.request(app).get(APIFindMany).end((req, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.data.length).to.greaterThan(0, "result null")
          return done()
        })
      })
    }) 
    describe('Get all feature', () => {
      const APIFindMany = '/api/user/findManyFeature'
      it('Should return 200 if successful', done => {
        chai.request(app).get(APIFindMany).end((req, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.data.length).to.greaterThan(0, "result null")
          return done()
        }) 
      })
    })
   
  })
})
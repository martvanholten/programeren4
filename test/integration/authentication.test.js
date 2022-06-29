process.env.DB_DATABASE = process.env.DB_DATABASE || 'movies_testdb'
process.env.NODE_ENV = 'testing'
process.env.LOGLEVEL = 'error'
console.log(`Running tests using database '${process.env.DB_DATABASE}'`)

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const pool = require('../../src/config/database')

chai.should()
chai.use(chaiHttp)

const CLEAR_DB = 'DELETE IGNORE FROM `user`'

describe('Authentication', () => {
  before((done) => {
    // console.log('beforeEach')
    pool.query(CLEAR_DB, (err, rows, fields) => {
      if (err) {
        console.log(`beforeEach CLEAR error: ${err}`)
        done(err)
      } else {
        done()
      }
    })
  })

  // After successful register we have a valid token. We export this token
  // for usage in other testcases that require login.
  // let validToken

  describe('UC101 Registation', () => {
    it('TC-101-1 should return a token when providing valid information', (done) => {
      chai
        .request(server)
        .post('/api/register')
        .send({
          firstname: 'FirstName',
          lastname: 'LastName',
          email: 'test@test.nl',
          studentnr: 1234567,
          password: 'secret'
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')

          const response = res.body
          response.should.have.property('token').which.is.a('string')
          // response.should.have.property('username').which.is.a('string')
          done()
        })
    })

    it('TC-101-2 should return an error on GET request', (done) => {
      chai
        .request(server)
        .get('/api/register')
        .end((err, res) => {
          res.should.have.status(404)
          res.body.should.be.a('object')
          done()
        })
    })

    it('TC-101-X should throw an error when no firstname is provided', (done) => {
      chai
        .request(server)
        .post('/api/register')
        .send({
          lastname: ' LastName ',
          email: 'test@test.nl',
          password: 'secret'
        })
        .end((err, res) => {
          res.should.have.status(422)
          // res.body.should.be.a('object')
          done()
        })
    })
  })

  describe('UC102 Login', () => {
    /**
     * This assumes that a user with given credentials exists. That is the case
     * when register has been done before login.
     */
    it('TC-102-1 should return a token when providing valid information', (done) => {
      chai
        .request(server)
        .post('/api/login')
        .send({
          email: 'test@test.nl',
          password: 'secret'
        })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          const response = res.body
          response.should.have.property('token').which.is.a('string')
          // response.should.have.property('username').which.is.a('string')
          done()
        })
    })
  })
})

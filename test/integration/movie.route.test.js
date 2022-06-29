process.env.DB_DATABASE = process.env.DB_DATABASE || 'movies_testdb'
process.env.NODE_ENV = 'testing'
process.env.LOGLEVEL = 'error'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const pool = require('../../src/config/database')
const logger = require('../../src/config/config').logger
const jwt = require('jsonwebtoken')
const assert = require('assert')

chai.should()
chai.use(chaiHttp)

logger.debug(`Running tests using database '${process.env.DB_DATABASE}'`)

/**
 * Query om alle tabellen leeg te maken, zodat je iedere testcase met
 * een schone lei begint. Let op, ivm de foreign keys is de volgorde belangrijk.
 *
 * Let ook op dat je in de dbconfig de optie multipleStatements: true toevoegt!
 */
const CLEAR_DB = 'DELETE IGNORE FROM `movies`;' + 'DELETE IGNORE FROM `user`;'
const CLEAR_MOVIES_TABLE = 'DELETE IGNORE FROM `movies`;'
const CLEAR_USERS_TABLE = 'DELETE FROM `user`;'

/**
 * Voeg een user toe aan de database. Deze user heeft ID 1.
 * Deze ID kun je als foreign key gebruiken in de andere queries, bv insert studenthomes.
 */
const INSERT_USER =
  'INSERT INTO `user` (`ID`, `First_Name`, `Last_Name`, `Email`, `Student_Number`, `Password` ) VALUES' +
  '(1, "first", "last", "name@server.nl","1234567", "secret");'

/**
 * Query om twee movies toe te voegen. Let op de UserId, die moet matchen
 * met de user die je ook toevoegt.
 */
const INSERT_MOVIES =
  'INSERT INTO `movies` (`ID`, `name`, `releaseyear`, `studio`, `userid`) VALUES ' +
  "(1, 'Movie A', 2010, 'Pixar', 1)," +
  "(2, 'Movie B', 2020, 'Paramount', 1);"

/**
 * Deze before staat buiten alle describes() en wordt daarom 1 x aangeroepen
 * voorafgaand aan de buitenste describe.
 */
before((done) => {
  pool.query(CLEAR_DB, (err, rows, fields) => {
    if (err) {
      logger.error(`before CLEARING tables: ${err}`)
      done(err)
    } else {
      done()
    }
  })
})

/**
 * Deze after staat buiten alle describes() en wordt daarom 1 x aangeroepen
 * na uitvoering van de buitenste describe. Merk op dat deze after niet per sé
 * nodig is, omdat de before altijd start met een lege database.
 */
after((done) => {
  pool.query(CLEAR_DB, (err, rows, fields) => {
    if (err) {
      console.log(`after error: ${err}`)
      done(err)
    } else {
      logger.info('After FINISHED')
      done()
    }
  })
})

describe.skip('Manage movies', () => {
  /**
   * Deze before() wordt 1 x uitgevoerd voorafgaand aan alle it-testcases binnen de
   * describe. We inserten hier de user, omdat dit slechts 1 x hoeft te gebeuren.
   * De testcases in dit bestand gaan de user namelijk niet wijzigen.
   */
  before((done) => {
    pool.query(INSERT_USER, (err, rows, fields) => {
      if (err) {
        logger.error(`before INSERT_USER: ${err}`)
        done(err)
      }
      if (rows) {
        logger.debug(`before INSERT_USER done`)
        done()
      }
    })
  })

  describe('UC201 Create movie - POST /api/movie', () => {
    beforeEach((done) => {
      pool.query(CLEAR_MOVIES_TABLE, (err, rows, fields) => {
        if (err) {
          logger.error(`beforeEach CLEAR_MOVIES_TABLE: ${err}`)
          done(err)
        }
        if (rows) {
          done()
        }
      })
    })

    after((done) => {
      pool.query(CLEAR_MOVIES_TABLE, (err, rows, fields) => {
        if (err) {
          logger.error(`after error: ${err}`)
          done(err)
        }
        if (rows) {
          done()
        }
      })
    })

    it('TC-201-1 should return valid error when required value is not present', (done) => {
      chai
        .request(server)
        .post('/api/movie')
        .set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, 'secret'))
        .send({
          releaseyear: 1234,
          studio: 'a studioname'
        })
        .end((err, res) => {
          assert.ifError(err)
          res.should.have.status(400)
          res.should.be.an('object')

          res.body.should.be.an('object').that.has.all.keys('message', 'error')

          let { message, error } = res.body
          message.should.be.an('string').that.equals('Error!')
          error.should.be.an('string')

          done()
        })
    })

    it('TC-201-2 should return a valid error when postal code is invalid', (done) => {
      done()
    })

    it('TC-201-6 should successfully add an item when posting valid values', (done) => {
      jwt.sign({ id: 1 }, 'secret', { expiresIn: '2h' }, (err, token) => {
        chai
          .request(server)
          .post('/api/movie')
          .set('authorization', 'Bearer ' + token)
          .send({
            name: 'a name',
            releaseyear: 1234,
            studio: 'a studioname'
          })
          .end((err, res) => {
            assert.ifError(err)
            res.should.have.status(200)
            res.body.should.be.an('object').that.has.property('result')

            let result = res.body.result
            result.should.be
              .an('object')
              .that.has.all.keys('id', 'name', 'releaseYear', 'studio')
            result.should.be
              .an('object')
              .that.has.property('id')
              .that.is.a('number')
            done()
          })
      })
    })
  })

  describe('UC202 List movies - GET /api/movie', () => {
    beforeEach((done) => {
      pool.query(CLEAR_MOVIES_TABLE, (err, rows, fields) => {
        if (err) {
          logger.error(`beforeEach CLEAR_MOVIES_TABLE: ${err}`)
          done(err)
        } else {
          done()
        }
      })
    })

    it('TC-202-1 should return empty list when database contains no items', (done) => {
      chai
        .request(server)
        .get('/api/movie')
        .end((err, res) => {
          assert.ifError(err)
          res.should.have.status(200)
          res.should.be.an('object')

          let { result } = res.body
          result.should.be.an('array').that.has.length(0)

          done()
        })
    })

    it('TC-202-2 should show 2 results', (done) => {
      pool.query(INSERT_MOVIES, (error, result) => {
        if (error) logger.debug(error)
        if (result) {
          chai
            .request(server)
            .get('/api/movie')
            .end((err, res) => {
              assert.ifError(err)
              res.should.have.status(200)
              res.should.be.an('object')

              let { result } = res.body
              result.should.be.an('array').that.has.length(2)

              let { id, name, releaseyear, studio } = result[0]
              name.should.be.a('string').that.equals('Movie A')
              releaseyear.should.be.a('number').that.equals(2010)
              studio.should.be.a('string').that.equals('Pixar')
              id.should.be.a('number').that.is.at.least(0)

              done()
            })
        }
      })
    })

    it('TC-202-3 should handle `?studio=` query param', (done) => {
      pool.query(INSERT_MOVIES, (error, result) => {
        if (error) logger.debug(error)
        if (result) {
          chai
            .request(server)
            .get('/api/movie?studio=Paramount')
            .end((err, res) => {
              assert.ifError(err)
              res.should.have.status(200)
              res.should.be.an('object')

              let { result } = res.body
              result.should.be.an('array').that.has.length(1)

              let { id, name, releaseyear, studio } = result[0]
              name.should.be.a('string').that.equals('Movie B')
              releaseyear.should.be.a('number').that.equals(2020)
              studio.should.be.a('string').that.equals('Paramount')
              id.should.be.a('number').that.is.at.least(0)

              done()
            })
        }
      })
    })

    it.skip('TC-202-4 should handle `?name=` query param', (done) => {
      pool.query(INSERT_MOVIES, (error, result) => {
        if (error) logger.debug(error)
        if (result) {
          chai
            .request(server)
            .get('/api/movie?name=Movie B')
            .end((err, res) => {
              assert.ifError(err)
              res.should.have.status(200)
              res.should.be.an('object')

              let { result } = res.body
              result.should.be.an('array').that.has.length(1)

              let { id, name, releaseyear, studio } = result[0]
              name.should.be.a('string').that.equals('Movie B')
              releaseyear.should.be.a('number').that.equals(2020)
              studio.should.be.a('string').that.equals('Paramount')
              id.should.be.a('number').that.is.at.least(0)

              done()
            })
        }
      })
    })
  })
})

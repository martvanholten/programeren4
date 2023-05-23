process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'
process.env.LOGLEVEL = 'warn'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const assert = require('assert')
require('dotenv').config()
const pool = require('../../src/config/database')
const jwt = require('jsonwebtoken')
const { jwtSecretKey, logger } = require('../../src/config/config')

chai.should()
chai.use(chaiHttp)

/**
 * Db queries to clear and fill the test database before each test.
 */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    "(1, 'first', 'last', 'name@server.nl', 'secret', 'street', 'city');"

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"

const INSERT_MEALS_USER =
    'INSERT INTO `meal_participants_user` (`mealId`, `userId`) VALUES (1,1)'

describe('meal API', () => {
    //
    // informatie over before, after, beforeEach, afterEach:
    // https://mochajs.org/#hooks
    //
    before((done) => {
        logger.debug(
            'before: hier zorg je eventueel dat de precondities correct zijn'
        )
        logger.debug('before done')
        done()
    })

    describe('UC meal', () => {
        //
        beforeEach((done) => {
            logger.debug('beforeEach called')
            // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
            pool.getConnection(function (err, connection) {
                if (err) throw err // not connected!
                connection.query(
                    CLEAR_DB + INSERT_USER + INSERT_MEALS,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release()
                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        logger.debug('beforeEach done')
                        done()
                    }
                )
            })
        })

        // TC-301 register a meal
        it('TC-301-1 should return valid error status when required value is not present', (done) => {
            chai.request(server)
                .post('/api/meal/register')
                // name is missing
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
                )
                .send(
                {
                    dateTime: "2022-05-22 13:35:00",
                    description: "description",
                    imageUrl: "imag.com",
                    price: "5"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.body.should.be.an('object');
                    let { message } = res.body
                    message.should.be.a('string')
                    done()
                })
        })

        it('TC-301-2 should return valid error status when user is not logged in', (done) => {
            chai.request(server)
                .post('/api/meal/register')
                .send({
                    name: "food",
                    dateTime: "2022-05-22 13:35:00",
                    description: "description",
                    imageUrl: "imag.com",
                    price: "5"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(401)
                    res.body.should.be.an('object');
                    let { message } = res.body
                    message.should.be.a('string')
                    done()
                })
        })

        it('TC-301-3 should return succes status when a meal is added', (done) => {
            chai.request(server)
                .post('/api/meal/register')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
                )
                .send(
                {
                    name: "Meal C",
                    dateTime: "2022-05-22 13:35:00",
                    description: "description",
                    imageUrl: "imag.com",
                    price: "5"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(201)
                    res.body.should.be.an('object');
                    let { results } = res.body
                    results.should.be.an('object')
                    done()
                })
        })

        // alter meal
        it('TC-302-1 should return valid error status when required data is missing', (done) => {
            chai.request(server)
                .post('/api/meal/alter/1')
                // name is missing
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send(    
                {
                    dateTime: "2022-05-22 13:35:00",
                    description: "description",
                    imageUrl: "imag.com",
                    price: "5"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.body.should.be.an('object');
                    let { message } = res.body
                    message.should.be.a('string')
                    done()
                })
        })

        it('TC-302-2 should return valid error status when user is not logged in', (done) => {
            chai.request(server)
                .post('/api/meal/alter/1')
                .send(
                {
                    name: "food",
                    dateTime: "2022-05-22 13:35:00",
                    description: "description",
                    imageUrl: "imag.com",
                    price: "5"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(401)
                    res.body.should.be.an('object');
                    let { message } = res.body
                    message.should.be.a('string')
                    done()
                })
        })

        it('TC-302-3 should return valid error status when meal is not from the user', (done) => {
            chai.request(server)
                .post('/api/meal/alter/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ userId: 10 }, jwtSecretKey),
                    )
                .send(
                {
                    name: "food",
                    dateTime: "2022-05-22 13:35:00",
                    description: "description",
                    imageUrl: "imag.com",
                    price: "5"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(403)
                    res.body.should.be.an('object');
                    let { message } = res.body
                    message.should.be.a('string')
                    done()
                })
        })

        it('TC-302-4 should return valid error status when meal does not exist', (done) => {
            chai.request(server)
                .post('/api/meal/alter/10')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ userId: 10 }, jwtSecretKey),
                    )
                .send(
                {
                    name: "food",
                    dateTime: "2022-05-22 13:35:00",
                    description: "description",
                    imageUrl: "imag.com",
                    price: "5"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(404)
                    res.body.should.be.an('object');
                    let { message } = res.body
                    message.should.be.a('string')
                    done()
                })
        })

        it('TC-302-5 should return valid succes status when meal is altered', (done) => {
            chai.request(server)
                .post('/api/meal/alter/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
                )
                .send(
                    {
                        name: "food",
                        dateTime: "2022-05-22 13:35:00",
                        description: "description",
                        imageUrl: "imag.com",
                        price: "5"
                    })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.body.should.be.an('object');
                    let { results } = res.body
                    results.should.be.an('object')
                    done()
                })
        })

        // get a list of meals
        it('TC-303-1 should return valid succes status when a list of meals is returned', (done) => {
            chai.request(server)
                .get('/api/meals/getall')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.body.should.be.an('object');
                    let { results } = res.body
                    results.should.be.an('object')
                    done()
                })
        })

        // TC-304 get meal detail
        it('TC-304-1 should return valid error status when the meal does not exist', (done) => {
            chai.request(server)
                .get('/api/meal/10')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(404)                    
                    res.body.should.be.an('object');
                    let { message } = res.body
                    message.should.be.a('string')
                    done()
                })
        })

        it('TC-304-2 should return valid succes status when the meal does exist', (done) => {
            chai.request(server)
                .get('/api/meal/1')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.body.should.be.an('object');
                    let { results } = res.body
                    results.should.be.an('object')
                    done()
                })
        })

        // TC-305 delete a meal
        it('TC-305-2 should return valid error status when a user is not logged in', (done) => {
            chai.request(server)
                .delete('/api/meal/delete/1')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(401)
                    res.body.should.be.an('object');
                    let { message } = res.body
                    message.should.be.a('string')
                    done()
                })
        })

        it('TC-305-3 should return valid error status when a user does not own the meal', (done) => {
            chai.request(server)
                .delete('/api/meal/delete/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ userId: 2 }, jwtSecretKey),
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(403)
                    res.body.should.be.an('object');
                    let { message } = res.body
                    message.should.be.a('string')
                    done()
                })
        })

        it('TC-305-4 should return valid error status when a meal does not exist', (done) => {
            chai.request(server)
                .delete('/api/meal/delete/10')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ userId: 10 }, jwtSecretKey),
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(404)
                    res.body.should.be.an('object');
                    let { message } = res.body
                    message.should.be.a('string')
                    done()
                })
        })

        it('TC-305-5 should return valid succes status when a meal is deleted', (done) => {
            chai.request(server)
                .delete('/api/meal/delete/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.body.should.be.an('object');
                    let { results } = res.body
                    results.should.be.an('object')
                    done()
                })
        })
    }),

    describe('meals test', () => {
        //
        beforeEach((done) => {
            logger.debug('beforeEach called')
            // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
            pool.getConnection(function (err, connection) {
                if (err) throw err // not connected!
                try {
                    connection.query(
                        CLEAR_DB + INSERT_USER  + INSERT_MEALS + INSERT_MEALS_USER,
                        function (error, results, fields) {
                            // When done with the connection, release it.
                            connection.release()
                            // Handle error after the release.
                            if (error) throw error
                            // Let op dat je done() pas aanroept als de query callback eindigt!
                            logger.debug('beforeEach done')
                            done()
                        }
                    )
                } catch (error) {
                    console.error(error);
                }
            })
        })

        // TC-401 sign up for a meal
        it('TC-401-1 should return valid error status when a user is not logged in', (done) => {
            chai.request(server)
                .post('/api/meal/signon/2')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(401)
                    res.body.should.be.an('object');
                    let { message } = res.body
                    message.should.be.a('string')
                    done()
                })
        })

        it('TC-401-2 should return valid error status when a meal does not exist', (done) => {
            chai.request(server)
                .post('/api/meal/signon/10')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey),
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(404)
                    res.body.should.be.an('object');
                    let { message } = res.body
                    message.should.be.a('string')
                    done()
                })
        })

        it('TC-401-3 should return valid sucess status when a user is signed up', (done) => {
            chai.request(server)
                .post('/api/meal/signon/2')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.body.should.be.an('object');
                    let { results, message } = res.body
                    results.should.be.an('object')
                    message.should.be.a('string')
                    done()
                })
        })
        
        
        // TC-402 sign off for a meal
        before((done) => {
            logger.debug('beforeEach called')
            // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
            pool.getConnection(function (err, connection) {
                if (err) throw err // not connected!
                try {
                    connection.query(
                        CLEAR_DB + INSERT_USER  + INSERT_MEALS + INSERT_MEALS_USER,
                        function (error, results, fields) {
                            // When done with the connection, release it.
                            connection.release()
                            // Handle error after the release.
                            if (error) throw error
                            // Let op dat je done() pas aanroept als de query callback eindigt!
                            logger.debug('beforeEach done')
                            done()
                        }
                    )
                } catch (error) {
                    console.error(error);
                }
            })
        })

        it('TC-402-1 should return valid error status when a user is not logged in', (done) => {
            chai.request(server)
                .post('/api/meal/signon/1')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(401)
                    res.body.should.be.an('object');
                    let { message } = res.body
                    message.should.be.a('string')
                    done()
                })
        })

        it('TC-402-2 should return valid error status when a meal does not exist', (done) => {
            chai.request(server)
                .post('/api/meal/signon/10')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey),
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(404)
                    res.body.should.be.an('object');
                    let { message } = res.body
                    message.should.be.a('string')
                    done()
                })
        })

        it('TC-402-3 should return valid sucess status when a user is signed off', (done) => {
            chai.request(server)
                .post('/api/meal/signon/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey),
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.body.should.be.an('object');
                    let { results, message } = res.body
                    results.should.be.an('object')
                    message.should.be.a('string')
                    done()
                })
        })
    })
})
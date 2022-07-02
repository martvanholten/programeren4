process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'
process.env.LOGLEVEL = 'warn'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const assert = require('assert')
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
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city`, `isActive`) VALUES' +
    ' (1, "first", "last", "name@server.nl", "secret", "street", "city", 1);' +
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city`, `isActive`) VALUES' +
    ' (2, "fabian", "last", "fabian@server.nl", "secret", "street", "city", 0);'

describe('user API', () => {
    //
    // informatie over before, after, beforeEach, afterEach:
    // https://mochajs.org/#hooks
    //

    describe('user tests', () => {
        //
        beforeEach((done) => {
            logger.debug('beforeEach called')
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            pool.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    CLEAR_DB + INSERT_USER,
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

        //TC-101 Login
        it('TC-101-1 should return valid error status when required value is not present', (done) => {
            chai.request(server)
                .post('/api/login')
                .send({
                    // password is missing
                    emailAdress: "name@server.nl"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    done()
                })
        })

        it('TC-101-2 should return a valid error status when email is invalid', (done) => {
            chai.request(server)
                .post('/api/login')
                .send({
                    // email is wrong
                    emailAdress: "nameserver.nl",
                    password: "secret"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    done()
                })
        })

        it('TC-101-3 should return a valid error status where password is invalid', (done) => {
            chai.request(server)
                .post('/api/login')
                .send({
                    // password is wrong
                    emailAdress: "name@server.nl",
                    password: "pas"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    done()
                })
        })

        it('TC-101-4 should return a valid error status where user is invalid', (done) => {
            chai.request(server)
                .post('/api/login')
                .send({
                    // user is wrong
                    emailAdress: "mart@server.nl",
                    password: "password"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(404)
                    done()
                })
        })

        it('TC-101-5 should return a succes status when a user loges in', (done) => {
            chai.request(server)
                .post('/api/login')
                //working user
                .send({
                    emailAdress: "name@server.nl",
                    password: "secret"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    done()
                })
        })

        // TC-201 Register new user
        it('TC-201-1 should return valid error status when required value is not present', (done) => {
            chai.request(server)
                .post('/api/register')
                .send({
                    // required data is missing
                    emailAdress: "name@server.nl"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    done()
                })
        })

        it('TC-201-2 should return a valid error status when email is invalid', (done) => {
            chai.request(server)
                .post('/api/register')
                .send({
                    // email is wrong
                    firstName: "mart", 
                    lastName: "holten", 
                    street: "street", 
                    city: "breda",
                    emailAdress: "nameserver.nl",
                    password: "secret"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    done()
                })
        })

        it('TC-201-3 should return a valid error status when password is invalid', (done) => {
            chai.request(server)
                .post('/api/register')
                .send({
                    // password is wrong
                    firstName: "mart", 
                    lastName: "holten", 
                    street: "street", 
                    city: "breda",
                    emailAdress: "mart@server.nl",
                    password: 1
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    done()
                })
        })

        it('TC-201-4 should return a valid error status when user already exists', (done) => {
            chai.request(server)
                .post('/api/register')
                .send({
                    // user already exists
                    firstName: "first", 
                    lastName: "last", 
                    street: "street", 
                    city: "city",
                    emailAdress: "name@server.nl",
                    password: "secret"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(409)
                    done()
                })
        })

        it('TC-201-5 should return a succes status when a new user registers', (done) => {
            chai.request(server)
                .post('/api/register')
                .send({
                    // new user
                    firstName: "first", 
                    lastName: "last", 
                    street: "street", 
                    city: "city",
                    emailAdress: "mvh@server.nl",
                    password: "secret"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(201)
                    done()
                })
        })

        // TC-202 list of users
        it('TC-202-1 should return a succes status when it returns no users', (done) => {
            chai.request(server)
                .get('/api/users/getall?firstName=f')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    done()
                })
        })

        it('TC-202-2 should return a succes status when it returns 2 users', (done) => {
            chai.request(server)
                .get('/api/users/getall?firstName=fa')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    done()
                })
        })

        it('TC-202-3 should return a succes status when it serches for a non existing name', (done) => {
            chai.request(server)
                .get('/api/users/getall?firstName=peter')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    done()
                })
        })

        it('TC-202-4 should return a succes status when it serches for isActive false', (done) => {
            chai.request(server)
                .get('/api/users/getall?firstName=f?isActive=false')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    done()
                })
        })

        it('TC-202-5 should return a succes status when it serches for isActive true', (done) => {
            chai.request(server)
                .get('/api/users/getall?firstName=f?isActive=true')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    done()
                })
        })

        it('TC-202-6 should return a succes status when it serches for a existing name', (done) => {
            chai.request(server)
                .get('/api/users/getall?firstName=first')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    done()
                })
        })

        // TC-203 get active user
        it('TC-203-1 should return a vallid error status when users get called', (done) => {
            chai.request(server)
                .get('/api/user/own')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(401)
                    done()
                })
        })

        it('TC-203-2 should return a succes status when the user gets called', (done) => {
            chai.request(server)
                .get('/api/user/own')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey)
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    done()
                })
        })

        // TC-204 get user by id
        it('TC-204-1 should return a vallid error status when the user did not log in', (done) => {
            chai.request(server)
                .get('/api/user/1')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(401)
                    done()
                })
        })

        it('TC-204-2 should return a vallid error status when the requested user does not exist', (done) => {
            chai.request(server)
                .get('/api/user/10')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey)
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(404)
                    done()
                })
        })

        it('TC-204-3 should return a vallid succes status when the requsted user does exist', (done) => {
            chai.request(server)
                .get('/api/user/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey)
                )
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    done()
                })
        })

        // TC-205 alter user
        it('TC-205-1 should return valid error status when required value is not present', (done) => {
            chai.request(server)
                .post('/api/user/alter/1')
                
                // email missing
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey),
                    {
                    firstName: "Mart",
                    lastName: "van Holten",
                    isActive: 1,
                    password: "mart",
                    street: "Rijngraafstraat",
                    city: "Breda",
                    phoneNumber: "0636457951"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    done()
                })
        })

        it('TC-205-3 should return valid error status when phonenumber is incorrect', (done) => {
            chai.request(server)
                .post('/api/user/alter/1')
                // phone number incorrect
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey),
                    {
                    firstName: "Mart",
                    lastName: "van Holten",
                    emailAdress: "mart@hotmail.com",
                    isActive: 1,
                    password: "mart",
                    roles: "editor,guest",
                    street: "Rijngraafstraat",
                    city: "Breda",
                    phoneNumber: 1
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    done()
                })
        })

        it('TC-205-4 should return valid error status when the user does not exist', (done) => {
            chai.request(server)
                .post('/api/user/alter/10')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey),
                    {
                    firstName: "Mart",
                    lastName: "van Holten",
                    emailAdress: "mart@hotmail.com",
                    isActive: 1,
                    password: "mart",
                    roles: "editor,guest",
                    street: "Rijngraafstraat",
                    city: "Breda",
                    phoneNumber: "0636457951"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    done()
                })
        })

        it('TC-205-5 should return valid error status when the user is not logged in', (done) => {
            chai.request(server)
                .post('/api/user/alter/10')
                .set({
                    firstName: "Mart",
                    lastName: "van Holten",
                    emailAdress: "mart@hotmail.com",
                    isActive: 1,
                    password: "mart",
                    roles: "editor,guest",
                    street: "Rijngraafstraat",
                    city: "Breda",
                    phoneNumber: "0636457951"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(401)
                    done()
                })
        })

        it('TC-205-6 should return succes status when the user is alterd', (done) => {
            chai.request(server)
                .post('/api/user/alter/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey),
                    {
                    firstName: "Mart",
                    lastName: "van Holten",
                    emailAdress: "bhv@hotmail.com",
                    isActive: 1,
                    password: "mart",
                    street: "Rijngraafstraat",
                    city: "Breda",
                    phoneNumber: "0636457951"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    logger.debug(res)
                    res.should.have.status(200)
                    done()
                })
        })

        // TC-206 delete user
        it('TC-206-1 should return error status when there is no user', (done) => {
            chai.request(server)
                .delete('/api/user/delete/10')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey)
                    )
                .end((err, res) => {
                    assert.ifError(err)
                    logger.debug(res)
                    res.should.have.status(400)
                })
        })

        it('TC-206-2 should return error status when the user is not logged in', (done) => {
            chai.request(server)
                .delete('/api/user/delete/1')
                .end((err, res) => {
                    assert.ifError(err)
                    logger.debug(res)
                    res.should.have.status(401)
                })
        })

        it('TC-206-3 should return error status when there is no user', (done) => {
            chai.request(server)
                .delete('/api/user/delete/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 2 }, jwtSecretKey)
                    )
                .end((err, res) => {
                    assert.ifError(err)
                    logger.debug(res)
                    res.should.have.status(403)
                })
        })

        it('TC-206-4 should return vallid status when the user is deleted', (done) => {
            chai.request(server)
                .delete('/api/user/delete/1')
                .set(
                    'authorization',
                    'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey)
                    )
                .end((err, res) => {
                    assert.ifError(err)
                    logger.debug(res)
                    res.should.have.status(200)
                })
        })
    })
})
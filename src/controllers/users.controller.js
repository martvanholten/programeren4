const assert = require('assert')
const jwt = require('jsonwebtoken')
const pool = require('../config/database')
const logger = require('../config/config').logger
const jwtSecretKey = require('../config/config').jwtSecretKey

module.exports = {
  login(req, res, next) {
    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('Error getting connection from pool')
        res
          .status(500)
          .json({ message: err.toString() })
      }
      if (connection) {
        // Check if the account exists.
        connection.query(
          'SELECT `id`, `firstname`, `lastname`, `emailAdress`, `password`, `phonenumber`, `roles`, `street`, `city` FROM `user` WHERE `emailAdress` = ?',
          [req.body.emailAdress],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.error('Error: ', err.toString())
              res.status(500).json({
                error: err.toString()
              })
            } else {
              // There was a result, check the password.
              logger.info('Result from database: ')
              logger.info(rows)
              if (
                rows &&
                rows.length === 1 &&
                rows[0].Password == req.body.password
              ) {
                logger.info('passwords DID match, sending valid token')
                // Create an object containing the data we want in the payload.
                const payload = {
                  id: rows[0].ID
                }
                // Userinfo returned to the caller.
                const userinfo = {
                  id: rows[0].id,
                  firstName: rows[0].firstname,
                  lastName: rows[0].lasrname,
                  password: rows[0].password,
                  phonenumber: rows[0].phonenumber,
                  roles: rows[0].roles,
                  street: rows[0].street,
                  city: rows[0].ciry,
                  token: jwt.sign(payload, jwtSecretKey, { expiresIn: '2h' })
                }
                logger.debug('Logged in, sending: ', userinfo)
                res.status(200).json(userinfo)
              } else {
                logger.info('User not found or password invalid')
                res.status(401).json({
                  message: 'User not found or password invalid'
                })
              }
            }
          }
        )
        pool.end((err)=>{
          console.log('Pool was colsed');
        })
      }
    })
  },
  validateLogin(req, res, next) {
    // Verify that we receive the expected input
    try {
      assert(typeof req.body.emailAdress === 'string', 'email must be a string.')
      assert(
        typeof req.body.password === 'string',
        'password must be a string.'
      )
      next()
    } catch (err) {
      res
        .status(422)
        .json({ error: err.toString() })
    }
  },
  register(req, res) {
    logger.info('register')
    logger.info(req.body)

    //Query the database to see if the email of the user to be registered already exists.
    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('Message: ' + err.toString())
        res
          .status(500)
          .json({ error: err.toString() })
      }
      if (connection) {
        let { firstname, lastname, emailAdress, password, street, city } = req.body

        connection.query(
          'INSERT INTO `user` (`firstname`, `lastname`, `emailAdress`, `password`, `street`, `city`) VALUES (?, ?, ?, ?, ?, ?)',
          [firstname, lastname, emailAdress, password, street, city],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              // When the INSERT fails, we assume the user already exists
              logger.error('Error: ' + err.toString())
              res.status(400).json({
                message: 'This email has already been taken.'
              })
            } else {
              logger.trace(rows)
              // Create an object containing the data we want in the payload.
              // This time we add the id of the newly inserted user
              const payload = {
                id: rows.insertId
              }
              // Userinfo returned to the caller.
              const userinfo = {
                id: rows.insertId,
                firstName: firstname,
                lastName: lastname,
                emailAdress: emailAdress,
                street: street,
                city: city,
                token: jwt.sign(payload, jwtSecretKey, { expiresIn: '24h' })
              }
              logger.debug('Registered', userinfo)
              res.status(200).json(userinfo)
            }
          }
        )
        pool.end((err)=>{
          console.log('Pool was colsed');
        })
      }
    })
  },

  //
  //
  //
  validateRegister(req, res, next) {
    // Verify that we receive the expected input
    console.log("Reached Validation")
    try {
      assert(
        typeof req.body.firstname === 'string',
        'firstname must be a string.'
      )
      assert(
        typeof req.body.lastname === 'string',
        'lastname must be a string.'
      )
      assert(typeof req.body.emailAdress === 'string', 'email must be a string.')
      assert(
        typeof req.body.password === 'string',
        'password must be a string.'
      )
      console.log("validation completed")
      next()
    } catch (ex) {
      console.log('validateRegister error: ', ex)
      res
        .status(422)
        .json({ message: err.toString(), datetime: new Date().toISOString() })
    }
  },

  //
  //
  //
  validateToken(req, res, next) {
    logger.info('validateToken called')
    // logger.trace(req.headers)
    // The headers should contain the authorization-field with value 'Bearer [token]'
    const authHeader = req.headers.authorization
    if (!authHeader) {
      logger.warn('Authorization header missing!')
      res.status(401).json({
        error: 'Authorization header missing!',
        datetime: new Date().toISOString()
      })
    } else {
      // Strip the word 'Bearer ' from the headervalue
      const token = authHeader.substring(7, authHeader.length)

      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          logger.warn('Not authorized')
          res.status(401).json({
            error: 'Not authorized',
            datetime: new Date().toISOString()
          })
        }
        if (payload) {
          logger.debug('token is valid', payload)
          // User heeft toegang. Voeg UserId uit payload toe aan
          // request, voor ieder volgend endpoint.
          req.userId = payload.id
          next()
        }
      })
    }
  },

  renewToken(req, res) {
    logger.debug('renewToken')

    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('Error getting connection from pool')
        res
          .status(500)
          .json({ error: err.toString(), datetime: new Date().toISOString() })
      }
      if (connection) {
        // 1. Kijk of deze useraccount bestaat.
        connection.query(
          'SELECT * FROM `user` WHERE `id` = ?',
          [req.userId],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.error('Error: ', err.toString())
              res.status(500).json({
                error: err.toString(),
                datetime: new Date().toISOString()
              })
            } else {
              // 2. User gevonden, return user info met nieuw token.
              // Create an object containing the data we want in the payload.
              const payload = {
                id: rows[0].ID
              }
              // Userinfo returned to the caller.
              const userinfo = {
                id: rows[0].id,
                firstName: rows[0].firstname,
                lastName: rows[0].lastname,
                emailAdress: rows[0].emailAdress,
                token: jwt.sign(payload, jwtSecretKey, { expiresIn: '2h' })
              }
              logger.debug('Sending: ', userinfo)
              res.status(200).json(userinfo)
            }
          }
        )
        pool.end((err)=>{
          console.log('Pool was colsed');
        })
      }
    })
  }
}

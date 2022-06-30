const jwt = require('jsonwebtoken')
const pool = require('../config/database')
const logger = require('../config/config').logger
const jwtSecretKey = require('../config/config').jwtSecretKey

module.exports = {
  login(req, res) {
    let {emailAdress, password} = req.body
    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('Error getting connection from pool')
        res
          .status(500)
          .json({ Message: err.toString() })
      }
      if (connection) {
        // Check if the account exists.
        connection.query(
          'SELECT * FROM `user` WHERE `emailAdress` = ?',
          [emailAdress],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.error('Error: ', err.toString())
              res.status(500).json({
                Message: err.toString()
              })
            } else if (rows && rows.length === 1){
              // There was a result, check the password.
              logger.info('Database responded: ')
              logger.info(rows)
              user = rows[0]
              const payload = {
                userId: user.id,
              }
                if (
                  user.password === req.body.password
                ) {
                  logger.info('Passwords did match, sending valid token')
                  jwt.sign(
                    payload,
                    jwtSecretKey,
                    { expiresIn: '12d' },
                    function (err, token) {
                        logger.debug(
                            'User logged in, sending: ',
                            user
                        )
                        res.status(200).json({
                            statusCode: 200,
                            results: { user, token },
                        })
                    }
                )
                }else {
                  logger.info('Error user password invalid')
                  res.status(400).json({
                    Message: 'Error: user password invalid'
                  })
                }
            }else{
              logger.info('Error user email not found')
              res.status(400).json({
              Message: 'Error: user email not found'
            })
          }
        })
      }
    })
  },
  
  register(req, res) {
    logger.info('registration called')
    logger.info(req.body)

    pool.getConnection((err, connection) => {
      if (err) {
        logger.error(err.toString())
        res
          .status(500)
          .json({ Message: err.toString() })
      }
      if (connection) {
        let { firstName, lastName, emailAdress, password, street, city } = req.body
        connection.query(
          'INSERT INTO `user` (`firstName`, `lastName`, `emailAdress`, `password`, `street`, `city`) VALUES (?, ?, ?, ?, ?, ?)',
          [firstName, lastName, emailAdress, password, street, city],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.error(err.toString())
              res.status(400).json({
                message: err.toString()
              })
            } else {
              logger.trace(rows)
              logger.info('Registered: ', rows)
              res.status(200).json('Account registerd')
            }
          }
        )
        // pool.end((err)=>{
        //   console.log('Pool was colsed');
        // })
      }
    })
  },

  get(req, res) {
    logger.trace('get called')
    logger.info(req.body)

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
          'SELECT * FROM `user` WHERE `id` = ?',
          [req.params.id],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.error('Error: ', err.toString())
              res.status(500).json({
                Message: err.toString()
              })
            } else if(rows && rows.length === 1){
              // There was a result, check the password.
              logger.info('Database responded: ')
              logger.info(rows)
                logger.info('User requested: ', rows)
                res.status(200).json(rows)
            }else{
              logger.info('Error: user id not found')
              res.status(400).json({
                Message: 'Error: user id not found'
              })
            }
          }
        )
      }
    })
  },

  getAll(req, res) {
    logger.trace('getAll called')
    logger.info(req.body)
    
    let { firstName, isActive } = req.query

    let queryString = 'SELECT * FROM user'
    if(firstName || isActive){
      queryString += ' WHERE '
      if(firstName){
        queryString += 'firstName LIKE ?'
      }
      if(firstName&&isActive){
        queryString += ' AND '
      } 
      if(isActive){
        queryString += 'isActive = ?'
      }
    }

    firstName = '%' + firstName + '%'

    pool.getConnection(function (err, connection) {
      if (err) {
        res.status(400).json({
          error: err.toString()
        })
      }
      if (connection) {
        connection.query(queryString,
        [firstName, isActive], 
        (err, rows, fields) => {
          connection.release()
          if (err) {
            res.status(400).json({
              message: err.toString()
            })
          }else{
            res.status(200).json({
              rows
            })
          }
        })
      }
    })
  },

  delete(req, res) {
    logger.trace('delete called')
    logger.info(req.body)

    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('Error getting connection from pool')
        res
          .status(500)
          .json({ message: err.toString() })
      }
      if (connection) {
        // delete the account
        connection.query(
          'DELETE FROM user WHERE id = ?',
          [req.params.id],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.error('Error: ', err.toString())
              res.status(500).json({
                Message: err.toString()
              })
            } else {
              logger.info('Account deleted')
              res.status(200).json('Account deleted')
            }
          }
        )
      }
    })
  },

  alter(req, res) {
    logger.trace('alter called')
    logger.info(req.body)

    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('Error getting connection from pool')
        res
          .status(500)
          .json({ message: err.toString() })
      }
      if (connection) {
        // Alter the account.
        let { firstName, lastName, emailAdress, password, street, city, phonenumber, isActive } = req.body
        connection.query(
          'UPDATE `user` SET `firstName` = ?, `lastName` = ?, `emailAdress` = ?, `password` = ?, `street` = ?, `city` = ?, `phonenumber` = ?, isActive = ? WHERE `id` = ?',
          [firstName, lastName, emailAdress, password, street, city, phonenumber, isActive, req.params.id],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.error('Error: ', err.toString())
              res.status(500).json({
                Message: err.toString()
              })
            }else if(rows && rows.length === 1){
              
              logger.info('User altert: ', rows)
              res.status(200).json(rows)
            }else {
              logger.info('Error: user id not found')
              res.status(400).json({
                Message: 'Error: user id not found'
              })
            }
          }
        )
      }
    })
  },

  validateToken(req, res, next) {
    logger.info('validateToken called')
    // logger.trace(req.headers)
    // The headers should contain the authorization-field with value 'Bearer [token]'
    const authHeader = req.headers.authorization
    if (!authHeader) {
      logger.warn('Authorization header missing!')
      res.status(401).json({
        Message: 'Authorization header missing!'
      })
    } else {
      // Strip the word 'Bearer ' from the headervalue
      const token = authHeader.substring(7, authHeader.length)

      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          logger.warn('Not authorized')
          res.status(401).json({
            Message: 'Not authorized'
          })
        }
        if (payload) {
          logger.info('token is valid', payload)
          // User has acces, add the payload id
          req.userId = payload.id
          next()
        }
      })
    }
  },

  renewToken(req, res) {
    logger.info('renewToken')
    let {id} = req.body

    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('Error getting connection from pool')
        res
          .status(500)
          .json({ Message: err.toString() })
      }
      if (connection) {
        // Check if the user exists.
        connection.query(
          'SELECT * FROM `user` WHERE `id` = ?',
          [id],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.error('Error: ', err.toString())
              res.status(500).json({
                Message: err.toString()
              })
            } else {
              // User found return user info with the new token.
              // Create an object containing the data we want in the payload.
              user = rows[0]
              const payload = {
                userId: user.id,
              }
                if (
                  user.password === req.body.password
                ) {
                  logger.info('Passwords did match, sending valid token')
                  jwt.sign(
                    payload,
                    jwtSecretKey,
                    { expiresIn: '12d' },
                    function (err, token) {
                        logger.debug(
                            'User logged in, sending: ',
                            user
                        )
                        res.status(200).json({
                            statusCode: 200,
                            results: { user, token },
                        })
                    }
                )
              }
            } 
          }
        )
        // pool.end((err)=>{
        //   console.log('Pool was colsed'); 
        // })
      }
    })
  }
}

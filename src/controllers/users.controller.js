const jwt = require('jsonwebtoken')
const pool = require('../config/database')
const logger = require('../config/config').logger
const jwtSecretKey = require('../config/config').jwtSecretKey

module.exports = {
  info(req, res){
    res.status(200).json({
      results: {name: 'Mart van Holten', number: '2168198', message: 'this is an system to sing up for meals'},
    })
  },

  login(req, res) {
    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('error getting connection from pool')
        res
          .status(500)
          .json({ message: err.toString() })
      }
      if (connection) {
        // Check if the account exists.
        connection.query(
          'SELECT * FROM `user` WHERE `emailAdress` = ?',
          [req.body.emailAdress],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.error('error: ', err.toString())
              res.status(422).json({
                message: err.toString()
              })
            } else if (rows && rows.length === 1 && rows[0].password == req.body.password){
              logger.info(
                'passwords DID match, sending userinfo and valid token'
              )
              // Extract the password from the userdata - we do not send that in the response.
              const { password, ...userinfo } = rows[0]
              // Create an object containing the data we want in the payload.
              const payload = {
                  userId: userinfo.id,
              }

              jwt.sign(
                  payload,
                  jwtSecretKey,
                  { expiresIn: '12d' },
                  function (err, token) {
                      logger.debug(
                          'User logged in, sending: ',
                          userinfo
                      )
                      res.status(200).json({
                          statusCode: 200,
                          results: { ...userinfo, token },
                      })
                  }
              )
            }else if(rows.length === 0){
              logger.info('error user does not exist')
                res.status(404).json({
                  message: 'error: user does not exist'
                })
            }else{
              logger.info('error user password invalid')
              res.status(400).json({
                message: 'error: user password invalid'
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
          .json({ message: err.toString() })
      }
      if (connection) {
        let { firstName, lastName, emailAdress, password, street, city } = req.body
        connection.query(
          'INSERT INTO `user` (`firstName`, `lastName`, `emailAdress`, `password`, `street`, `city`) VALUES (?, ?, ?, ?, ?, ?)',
          [firstName, lastName, emailAdress, password, street, city],
          (err, rows, fields) => {
            if (err) {
              logger.error(err.toString())
              res.status(409).json({
                message: err.toString()
              })
            } else {
              pool.getConnection((err, connection) => {
                if (err) {
                  logger.error(err.toString())
                  res
                    .status(500)
                    .json({ message: err.toString() })
                }
                if (connection) {
                  connection.query(
                    'SELECT * FROM `user` WHERE `emailAdress` = ?',
                    [emailAdress],
                    (err, rows, fields) => {
                      connection.release()
                      if (err) {
                        logger.error(err.toString())
                        res.status(409).json({
                          message: err.toString()
                        })
                      } else {
                        logger.info('result: ', rows)
                        res.status(201).json({
                          results: {rows}})
                      }
                    }
                  )
                }
              })
            }
          }
        )
      }
    })
  },

  get(req, res) {
    logger.trace('get called')
    logger.info(req.body)

    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('error getting connection from pool')
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
              logger.error('error: ', err.toString())
              res.status(422).json({
                message: err.toString()
              })
            } else if(rows && rows.length === 1){

              const { password, ...userinfo } = rows[0]
              pool.getConnection((err, connection) => {
                if (err) {
                  logger.error('error getting connection from pool')
                  res
                    .status(500)
                    .json({ message: err.toString() })
                }
                if (connection) {
                  // Check if the account has meals to sing up to.
                  connection.query(
                    'SELECT * FROM `meal` WHERE `dateTime` > ? && `cookId` = ?' ,
                    ['2022-07-04 10:00:00', req.params.id], 
                    (err, rows, fields) => {
                      connection.release()
                      if (err) {
                        logger.error('error: ', err.toString())
                        res.status(422).json({
                          message: err.toString()
                        })
                      } else if(rows && rows.length >= 1){
                          logger.info('meals: ', rows)
                          res.status(200).json({results: {userinfo}, meals: {rows}})
                      }else{
                        logger.info(userinfo, 'no meals available')
                        res.status(200).json({
                          results: {userinfo}, meals: 'no meals available'
                        })
                      }
                    }
                  )
                }
              })
            }else{
              logger.info('error: user id not found')
              res.status(404).json({
                message: 'error: user id not found'
              })
            }
          }
        )
      }
    })
  },

  getOwn(req, res) {
    logger.trace('get called')
    logger.info(req.body)
    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('error getting connection from pool')
        res
          .status(500)
          .json({ message: err.toString() })
      }
      if (connection) {
        // Check if the account exists.
        connection.query(
          'SELECT * FROM `user` WHERE `id` = ?',
          [req.userId],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.error('error: ', err.toString())
              res.status(422).json({
                message: err.toString()
              })
            } else if(rows && rows.length === 1){
              logger.info('Database responded: ')
              logger.info(rows)
                logger.info('User requested: ', rows)
                res.status(200).json({results: {rows}})
            }else{
              logger.info('error: user id not found')
              res.status(404).json({
                message: 'error: user id not found'
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

    let queryString = 'SELECT * FROM `user`'
    if(firstName || isActive){
      queryString += ' WHERE '
      if(firstName){
        queryString += '`firstName` LIKE ?'
        firstName = '%' + firstName + '%'
      }
      if(firstName&&isActive){
        queryString += ' AND '
      } 
      if(isActive){
        queryString += '`isActive` = ?'
      }
    }

    if(firstName){
      pool.getConnection(function (err, connection) {
        if (err) {
          res.status(500).json({
            error: err.toString()
          })
        }
        logger.debug(queryString)
        if (connection) {
          connection.query(queryString,
          [firstName, isActive], 
          (err, rows, fields) => {
            connection.release()
            if (err) {
              res.status(422).json({
                message: err.toString()
              })
            }else{
              const userList = []
              for (var i = 0; i < rows.length; i++) {
                const { password, ...userinfo } = rows[i]
                userList.push(userinfo)
              }
              res.status(200).json( {results: {userList}})
            }
          })
        }
      })
    }else if(isActive){
      pool.getConnection(function (err, connection) {
        if (err) {
          res.status(500).json({
            error: err.toString()
          })
        }
        logger.debug(queryString)
        if (connection) {
          connection.query(queryString,
          [isActive], 
          (err, rows, fields) => {
            connection.release()
            if (err) {
              res.status(422).json({
                message: err.toString()
              })
            }else{
              const userList = []
              for (var i = 0; i < rows.length; i++) {
                const { password, ...userinfo } = rows[i]
                userList.push(userinfo)
              }
              res.status(200).json( {results: {userList}})
            }
          })
        }
      })
    }else{
      pool.getConnection(function (err, connection) {
        if (err) {
          res.status(500).json({
            error: err.toString()
          })
        }
        logger.debug(queryString)
        if (connection) {
          connection.query(queryString,
          (err, rows, fields) => {
            connection.release()
            if (err) {
              res.status(422).json({
                message: err.toString()
              })
            }else{
              const userList = []
              for (var i = 0; i < rows.length; i++) {
                const { password, ...userinfo } = rows[i]
                userList.push(userinfo)
              }
              res.status(200).json( {results: {userList}})
            }
          })
        }
      })
    }
  },

  delete(req, res) {
    logger.trace('delete called')
    logger.info(req.body)

    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('error getting connection from pool')
        res
          .status(500)
          .json({ message: err.toString() })
      }
      if (connection) {
        // delete the account
        connection.query(
          'SELECT * FROM `user` WHERE `id` = ?',
          [req.params.id],
          (err, rows, fields) => {
            if (err) {
              logger.error('error: ', err.toString())
              res.status(400).json({
                message: err.toString()
              })
            } else if(rows && rows.length === 1){
              if(req.userId == rows[0].id){
                userInfo = rows
                pool.getConnection((err, connection) => {
                  if (err) {
                    logger.error('error getting connection from pool')
                    res
                      .status(500)
                      .json({ message: err.toString() })
                  }
                  if (connection) {
                    // delete the account
                    connection.query(
                      'DELETE FROM `user` WHERE `id` = ?',
                      [req.userId],
                      (err, rows, fields) => {
                        if (err) {
                          logger.error('error: ', err.toString())
                          res.status(400).json({
                            message: err.toString()
                          })
                        } else {
                          logger.info('result: deleted ', userInfo)
                          res.status(200).json({results: {userInfo}, message: 'deleted user' })
                        }
                      }
                    )
                  }
                })
              }else{
                logger.info('this is not your account')
                res.status(403).json({message: 'this is not your account'})
              }
            }else{
              logger.info('there is no account')
              res.status(404).json({message: 'there is no account'})
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
        logger.error('error getting connection from pool')
        res
          .status(500)
          .json({ message: err.toString() })
      }
      if (connection) {
        
        connection.query(
          'SELECT * FROM `user` WHERE id = ?',
          [req.params.id],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.info('error: ' + err.toString)
              res.status(400).json({
                message: err.toString()
              })
            }else if(rows && rows.length === 1){
              if(rows[0].id == req.userId){
                pool.getConnection((err, connection) => {
                  if (err) {
                    logger.error('error getting connection from pool')
                    res
                      .status(500)
                      .json({ message: err.toString() })
                  }
                  if (connection) {
                    // Alter the account.
                    let { firstName, lastName, emailAdress, password, street, city, phoneNumber, isActive} = req.body
                    connection.query(
                      'UPDATE `user` SET `firstName` = ?, `lastName` = ?, `emailAdress` = ?, `password` = ?, `street` = ?, `city` = ?, `phoneNumber` = ?, isActive = ? WHERE `id` = ?',
                      [firstName, lastName, emailAdress, password, street, city, phoneNumber, isActive, req.params.id],
                      (err, rows, fields) => {
                        connection.release()
                        if (err) {
                          logger.info('error: ' + err.toString)
                          res.status(400).json({
                            message: err.toString
                          })
                        }else{
                          logger.info('message: ', req.body)
                          res.status(200).json({results: req.body})
                        }
                      }
                    )
                  }
                })
              }else{
                logger.info('message: this is not your user')
                res.status(403).json({message: 'this is not your user'})
              }
            }else{
              logger.info('message: user not found')
              res.status(404).json({message: 'user not found'})
            }
          }
        )
      }
    })
  },
}

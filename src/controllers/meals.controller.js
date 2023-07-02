const config = require('../config/config')
const logger = config.logger
const pool = require('../config/database')

module.exports = {
  register(req, res) {
    logger.trace('Meal registration called')
    logger.info(req.body)

    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('error getting connection from pool')
        res
          .status(500)
          .json({ message: err.toString() })
      }
      if (connection) {
        let { name, dateTime, description, imageUrl, price } = req.body
        connection.query(
          'INSERT INTO `meal` (`name`, `dateTime`, `description`, `imageUrl`, `price`, `cookId`) VALUES (?, ?, ?, ?, ?, ?)',
          [name, dateTime, description, imageUrl, price, req.userId],
          (err, rows, fields) => {
            if (err) {
              logger.error('error: ', err.toString())
              res.status(400).json({
                message: err.toString()
              })
            } else {
              pool.getConnection((err, connection) => {
                if (err) {
                  logger.error('error getting connection from pool')
                  res
                    .status(500)
                    .json({ message: err.toString() })
                }
                if (connection) {
                  connection.query(
                    'SELECT * FROM `meal` WHERE `name` = ?',
                    [name],
                    (err, rows, fields) => {
                      connection.release()
                      if (err) {
                        logger.error('error: ', err.toString())
                        res.status(400).json({
                          message: err.toString()
                        })
                      } else {
                        logger.info('message: ', rows)
                        res.status(201).json({results: {rows}})
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
        // Check if the meal exists.
        connection.query(
          'SELECT * FROM `meal` WHERE `id` = ?',
          [req.params.id],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.error('error: ', err.toString())
              res.status(422).json({
                message: err.toString()
              })
            }else if(rows && rows.length === 1){
            logger.info('Database responded: ')
            logger.info(rows)
            logger.info('User requested: ', rows)
            res.status(200).json({results: {rows}})
            }else {
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
    pool.getConnection(function (err, connection) {
      if (err) {
        res.status(400).json({
          message: 'GetAll failed!',
          message: err.toString()
        })
      }
      if (connection) {
        connection.query('SELECT * FROM `meal`', (err, rows, fields) => {
          connection.release()
          if (err) {
            res.status(422).json({
              message: 'GetAll failed!',
              message: err.toString()
            })
          }else{
            logger.trace('results: ', rows)
            res.status(200).json({results: {rows}})
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
          logger.error('error getting connection from pool')
          res
            .status(500)
            .json({ message: err.toString() })
        }
        if (connection) {
          // delete the account
          connection.query(
            'SELECT * FROM `meal` WHERE `id` = ?',
            [req.params.id],
            (err, rows, fields) => {
              if (err) {
                logger.error('error: ', err.toString())
                res.status(400).json({
                  message: err.toString()
                })
              } else if(rows && rows.length === 1){
                if(rows[0].cookId === req.userId){
                  mealInfo = rows
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
                      'DELETE FROM `meal` WHERE `id` = ?',
                      [req.params.id],
                      (err, rows, fields) => {
                        connection.release()
                        if (err) {
                          logger.error('error: ', err.toString())
                          res.status(400).json({
                            message: err.toString()
                          })
                        } else {
                          logger.info(rows)
                          logger.info('message: ', mealInfo)
                          res.status(200).json({results: {mealInfo}})
                        }
                      }
                    )
                  }
                })
                }else{
                  logger.info('this meal belongs to someone else')
                  res.status(403).json({message: 'this meal belongs to someone else'})
                } 
              }else{
                logger.info('this meal does not exist')
                res.status(404).json({message: 'this meal does not exist'})
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
            'SELECT * FROM `meal` WHERE `id` = ?',
            [req.params.id],
            (err, rows, fields) => {
              if (err) {
                logger.error('error: ', err.toString())
                res.status(404).json({
                  message: err.toString()
                })
              } else if(rows && rows.length === 1){
                if(rows[0].cookId == req.userId){
                  mealInfo = rows
                  pool.getConnection((err, connection) => {
                    if (err) {
                      logger.error('error getting connection from pool')
                      res
                        .status(500)
                        .json({ message: err.toString() })
                    }
                    if (connection) {
                      // Alter the account
                      let { name, dateTime, description, imageUrl, price } = req.body
                      connection.query(
                        'UPDATE `meal` SET `name` = ?, `datetime` = ?, `description` = ?, `imageUrl` = ?, `price` = ? WHERE `id` = ?',
                        [name, dateTime, description, imageUrl, price, req.params.id],
                        (err, rows, fields) => {
                          connection.release()
                          if (err) {
                            logger.info('error: ' + err.toString)
                            res.status(400).json({
                              message: err.toString()
                            })
                          }else{
                            logger.info('meal altert: ', {mealInfo})
                            res.status(200).json({results: {mealInfo}})
                          }
                        }
                      )
                    }
                  })
                }else{
                  logger.info('this is not your meal')
                  res.status(403).json({
                    message: 'this is not your meal'
                  })
                }
              }else{
                logger.info('this meal does not exist')
                res.status(404).json({message: 'this meal does not exist'})
              }
            }
          )
        }
      })
  },

  signOn(req, res) {
    logger.trace('sign on called')
    logger.info(req.body)

    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('error getting connection from pool')
        res
          .status(500)
          .json({ message: err.toString() })
      }
      connection.query(
        'SELECT * FROM `meal` WHERE `id` = ?',
        [req.params.id],
        (err, rows, fields) => {
          connection.release()
          logger.debug(rows)
          logger.debug(rows.length)
          if (err) {
            logger.error('error: ', err.toString())
            res.status(404).json({
              message: err.toString()
            })
          }else if(rows && rows.length === 1){
            mealInfo = rows[0]
            logger.error(mealInfo.maxAmountOfParticipants, 'hello world')
            // test
            if (connection) {
              connection.query(
                'SELECT * FROM `meal_participants_user` WHERE `mealId` = ?',
                [req.params.id],
                (err, rows, fields) => {
                  logger.error(mealInfo.maxAmountOfParticipants, rows.length, 'hello world')
                  if (err) {
                    logger.error('error: ', err.toString())
                    res.status(422).json({
                      message: err.toString()
                    })
                  }else if(rows.length <= mealInfo.maxAmountOfParticipants){                    
                    if (connection) {
                      connection.query(
                        'SELECT * FROM `meal_participants_user` WHERE `mealId` = ? && `userId` = ?',
                        [req.params.id, req.userId],
                        (err, rows, fields) => {
                          if (err) {
                            logger.error('error: ', err.toString())
                            res.status(422).json({
                              message: err.toString()
                            })
                          }else if(rows && rows.length > 0){                        
                            logger.info(mealInfo)
                            logger.info('already singed up for this course')
                            res.status(200).json({results: {mealInfo}, message: "already singed up for this course"})                        
                          }else{
                            connection.query(
                              'INSERT INTO `meal_participants_user` (`mealId`, `userId`) VALUES (?,?)',
                              [req.params.id, req.userId],
                              (err, rows, fields) => {
                                connection.release()
                                if (err) {
                                  logger.error('error: ', err.toString())
                                  res.status(422).json({
                                    message: err.toString()
                                  })
                                } else {
                                  logger.info(mealInfo)
                                  logger.info('Singed up for the meal')
                                  res.status(200).json({results: {mealInfo}, message: "signed up for the meal"})
                                }
                            })
                          }
                        }
                      )
                    }                      
                  }else{
                    logger.info(mealInfo)
                    logger.info('max aumont of participants reached')
                    res.status(200).json({message: "max aumont of participants reached"})                        
                  }
                }
              )
            }
          }else{
              logger.info('There is no meal')
              res.status(404).json({message: 'There is no meal'})
          }
        }
      )
    })
  },

  signOff(req, res) {
    logger.trace('sign on called')
    logger.info(req.body)

    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('error getting connection from pool')
        res
          .status(500)
          .json({ message: err.toString() })
      }
      connection.query(
        'SELECT * FROM `meal` WHERE `id` = ?',
        [req.params.id],
        (err, rows, fields) => {
          connection.release()
          logger.debug(rows)
          logger.debug(rows.length)
          if (err) {
            logger.error('error: ', err.toString())
            res.status(404).json({
              message: err.toString()
            })
          }else if(rows && rows.length === 1){
            mealInfo = rows
            if (connection) {
              connection.query(
                'SELECT * FROM `meal_participants_user` WHERE `mealId` = ? && `userId` = ?',
                [req.params.id, req.userId],
                (err, rows, fields) => {
                  if (err) {
                    logger.error('error: ', err.toString())
                    res.status(422).json({
                      message: err.toString()
                    })
                  }else if(rows && rows.length > 0){
                    connection.query(
                      'DELETE FROM `meal_participants_user` WHERE `mealId` = ? && `userId` = ?',
                      [req.params.id, req.userId],
                      (err, rows, fields) => {
                        connection.release()
                        if (err) {
                          logger.error('error: ', err.toString())
                          res.status(422).json({
                            message: err.toString()
                          })
                        }else {
                          logger.info(mealInfo)
                          logger.info('Signed off for the meal')
                          res.status(200).json({results: {mealInfo}, message: "signed off for the meal"})
                        }
                      }
                    )
                  }else{
                    logger.info(mealInfo)
                    logger.info('you are not signed up for this meal')
                    res.status(404).json({message: "you are not signed up for this meal"})                                            
                  }
                }
              )
            }
          }else{
              logger.info('There is no meal')
              res.status(404).json({message: 'There is no meal'})
          }
        }
      )
    })
  },

  getSignup(req, res) {
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
        // Check if the meal exists.
        connection.query(
          'SELECT * FROM `meal_participants_user` WHERE `mealId` = ?',
          [req.params.id],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.error('error: ', err.toString())
              res.status(422).json({
                message: err.toString()
              })
            }else if(rows && rows.length >= 1){
            logger.info('Database responded: ')
            logger.info(rows)
            logger.info('meal requested: ', rows)
            res.status(200).json({results: {rows}})
            }else {
              logger.info('error: meal id not found')
              res.status(404).json({
              message: 'error: meal id not found'
              })
            }
          }
        )
      }
    })
  },

  getSignupParticipant(req, res) {
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
        // Check if the meal exists.
        connection.query(
          'SELECT * FROM `meal_participants_user` WHERE `mealId` = ?',
          [req.params.id],
          (err, rows, fields) => {
            if (err) {
              logger.error('error: ', err.toString())
              res.status(422).json({
                message: err.toString()
              })
            }else if(rows && rows.length >= 1){
              connection.query(
                'SELECT * FROM `meal` WHERE `id` = ?',
                [req.params.id],
                (err, rowsMeal, fields) => {
                  if (err) {
                    logger.error('error: ', err.toString())
                    res.status(422).json({
                      message: err.toString()
                    })
                  }else if(rowsMeal[0].cookId == req.userId){
                    // let resultUser = []
                    // async function getUser() {
                      for (var i = 0; i < rows.length; i++){
                        if(rows[i].userId == req.params.userId){
                          connection.query(
                            'SELECT * FROM `user` WHERE `id` = ?',
                            [req.params.userId],
                            (err, rowsUser, fields) => {
                              connection.release()
                              if (err) {
                                logger.error('error: ', err.toString())
                                res.status(422).json({
                                  message: err.toString()
                                })
                              }else{
                                logger.info('participants requested: ', rowsUser)
                                res.status(200).json({
                                results: rowsUser
                                })
                                // resultUser.push(rowsUser)
                                // logger.info('participants requested: ', resultUser[0])
                              }
                             }
                          )
                        }
                      }  
                    // }
                    // async function returnUser() {
                    //   await getUser
                    //   if(resultUser.length == 1){
                    //     logger.info('participants requested: ', resultUser[0])
                    //     res.status(200).json({
                    //     results: resultUser
                    //     })
                    //   }else{
                    //     logger.info('error: user is not an particepant')
                    //     res.status(404).json({
                    //     message: 'error: user is not an particepant'
                    //     })
                    //   }
                    // }
                  }else {
                    logger.info('error: this is not your meal', req.userId, rowsMeal[0].cookId)
                    res.status(402).json({
                    message: 'error: this is not your meal'
                    })
                  }
                }
              )
            }else {
              logger.info('error: meal does not exist or have any particepants')
              res.status(404).json({
              message: 'error: meal does not exist or have any particepants'
              })
            }
          }
        )
      }
    })
  },
}
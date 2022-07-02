const config = require('../config/config')
const logger = config.logger
const assert = require('assert')
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
            connection.release()
            if (err) {
              logger.error('error: ', err.toString())
              res.status(400).json({
                message: err.toString()
              })
            } else {
              logger.info(rows)
              logger.trace(rows)
              logger.info('result: ', rows)
              res.status(201).json({result: rows})
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
            res.status(200).json({result: rows})
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
            res.status(200).json({results: rows})
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
          'SELECT cookId FROM `meal` WHERE `cookId` = ?',
          [req.userId],
          (err, rows, fields) => {
            if (err) {
              logger.error('error: ', err.toString())
              res.status(404).json({
                message: err.toString()
              })
            } else if(rows && rows.length === 1){
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
                        res.status(404).json({
                          message: err.toString()
                        })
                      } else {
                        logger.info(rows)
                        logger.info('result: ', rows)
                        res.status(200).json({result: rows})
                      }
                    }
                  )
                }
              })
            }else{
              logger.info('this meal belongs to someone else')
              res.status(403).json({message: 'this meal belongs to someone else'})
            }
          }
        )
      }
    })    
  },

  alter(req, res) {
    logger.trace('alter called')
    logger.info(req.body)
    if(req.userId === req.params.id){
      pool.getConnection((err, connection) => {
        if (err) {
          logger.error('error getting connection from pool')
          res
            .status(500)
            .json({ message: err.toString() })
        }
        if (connection) {
          // Alter the account.
          let { name, dateTime, description, imageUrl, price } = req.body
          connection.query(
            'UPDATE `meal` SET `name` = ?, `datetime` = ?, `description` = ?, `imageUrl` = ?, `price` = ? WHERE `id` = ?',
            [name, dateTime, description, imageUrl, price, req.params.id],
            (err, rows, fields) => {
              connection.release()
              if (err) {
                logger.info('error: meal id not found')
                res.status(404).json({
                  message: err.toString()
                })
              }else{
                logger.info('Meal altert: ', rows)
                res.status(200).json({Altert: rows})
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
  },

  signOff(req, res) {
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
                    logger.info(rows)
                    logger.info('Signed off for the meal: ', rows)
                    res.status(200).json({Signedoff: rows})
                  }
                }
              )
            }else {
              logger.error('You did not sing up for the meal')
              res.status(404).json({
                message: 'You did not sing up for the meal'
              })
            }
          }
        )
      }
    })
  },

  signOn(req, res) {
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
          // INSERT INTO `meal` (`name`, `dateTime`, `description`, `imageUrl`, `price`) VALUES (?, ?, ?, ?, ?)
          'INSERT INTO `meal_participants_user` (`mealId`, `userId`) VALUES (?,?)',
          [req.params.id, req.userId],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.error('error: ', err.toString())
              res.status(404).json({
                message: err.toString()
              })
            } else {
              logger.info(rows)
              logger.info('Singed up for the meal: ', rows)
              res.status(200).json({Singedup: rows})
            }
          }
        )
      }
    })
  },
}

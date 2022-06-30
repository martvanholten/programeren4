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
        logger.error('Error getting connection from pool')
        res
          .status(500)
          .json({ message: err.toString() })
      }
      if (connection) {
        let { name, dateTime, description, imageUrl, price } = req.body
        connection.query(
          'INSERT INTO `meal` (`name`, `dateTime`, `description`, `imageUrl`, `price`) VALUES (?, ?, ?, ?, ?)',
          [name, dateTime, description, imageUrl, price],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.error('Error: ', err.toString())
              res.status(500).json({
                Message: err.toString()
              })
            } else {
              logger.info(rows)
              logger.trace(rows)
              logger.info('Meal registered')
              res.status(200).json('Meal registered')
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
        logger.error('Error getting connection from pool')
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
              logger.error('Error: ', err.toString())
              res.status(500).json({
                Message: err.toString()
              })
            }else if(rows && rows.length === 1){
            logger.info('Database responded: ')
            logger.info(rows)
            logger.info('User requested: ', rows)
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
        connection.query('SELECT * FROM meal', (err, rows, fields) => {
          connection.release()
          if (err) {
            res.status(400).json({
              message: 'GetAll failed!',
              message: err.toString()
            })
          }else{
            logger.trace('results: ', rows)
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
          'DELETE FROM meal WHERE id = ?',
          [req.params.id],
          (err, rows, fields) => {
            connection.release()
            if (err) {
              logger.error('Error: ', err.toString())
              res.status(500).json({
                Message: err.toString()
              })
            } else {
              logger.info(rows)
              logger.info('Account deleted')
              res.status(200).json('Account deleted')
            }
          }
        )
      }
    })
  },
}

const config = require('../config/config')
const logger = config.logger
const assert = require('assert')
const pool = require('../config/database')

let controller = {
  getAll(req, res, next) {
    logger.trace('studioController.getAll called')
    let sqlQuery = 'SELECT * from studio'
    logger.debug('getAll', 'sqlQuery =', sqlQuery)

    pool.getConnection(function (err, connection) {
      if (err) {
        res.status(400).json({
          message: 'GetAll failed!',
          error: err
        })
      }
      if (connection) {
        connection.query(sqlQuery, (error, results, fields) => {
          connection.release()
          if (error) {
            res.status(400).json({
              message: 'GetAll failed!',
              error: error
            })
          }
          if (results) {
            logger.trace('results: ', results)
            const mappedResults = results.map((item) => {
              return {
                id: item.id,
                name: item.name,
                userid: item.userid
              }
            })
            res.status(200).json({
              result: mappedResults
            })
          }
        })
      }
    })
  }
}

module.exports = controller

const config = require('../config/config')
const logger = config.logger
const assert = require('assert')
const database = require('../config/database')
const pool = require('../config/database')

let controller = {
  //
  validateMovie(req, res, next) {
    logger.info('validate movie')
    logger.info(req.body)
    try {
      const { name, releaseyear, studioid } = req.body
      assert(typeof name === 'string', 'name is missing!')
      assert(typeof releaseyear === 'number', 'releaseyear is missing!')
      logger.trace('Movie data is valid')
      next()
    } catch (err) {
      logger.trace('Movie data is INvalid: ', err)
      res.status(400).json({
        message: 'Error!',
        error: err.toString()
      })
    }
  },

  createMovie(req, res, next) {
    logger.info('createMovie called')
    const movie = req.body
    let { name, releaseyear, ageCategory, inTheatres, studioid } = movie
    logger.trace('movie =', movie)

    // !!
    const userid = req.userId

    let sqlQuery =
      'INSERT INTO `movies` (`name`, `releaseyear`, `studioid`, `ageCategory`, `inTheatres`,`userid`) VALUES (?, ?, ?, ?, ?, ?)'
    logger.debug('createMovie', 'sqlQuery =', sqlQuery)

    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error('createMovie', error)
        res.status(400).json({
          message: 'createMovie failed getting connection!',
          error: err
        })
      }
      if (connection) {
        // Use the connection
        connection.query(sqlQuery,
          [
            name,
            releaseyear,
            parseInt(studioid, 10),
            ageCategory,
            inTheatres,
            userid
          ],
          (error, results, fields) => {
            // When done with the connection, release it.
            connection.release()
            // Handle error after the release.
            if (error) {
              logger.error('createMovie', error.toString())
              res.status(400).json({
                message: 'createMovie failed calling query',
                error: error.toString()
              })
            }
            if (results) {
              logger.trace('results: ', results)
              res.status(200).json({
                result: {
                  id: results.insertId,
                  ...movie
                }
              })
            }
          }
        )
      }
    })
  },

  /**
   * Geef alle movies, met optioneel query params.
   *
   * URL: localhost:3000/api/movie?email=jsmit@server.nl&studio=Pixar
   *
   * @param {*} req Incoming request object
   * @param {*} res Response to be returned
   * @param {*} next function to next route handler
   */
  getAll(req, res, next) {
    logger.trace('getAll called')
    // We willen de user info bij iedere film ophalen; we doen dat via een JOIN.
    let sqlQuery =
      'SELECT ' +
      'movies.id,' +
      'movies.name,' +
      'movies.releaseyear,' +
      'studio.name as studio,' +
      'movies.ageCategory,' +
      'movies.inTheatres,' +
      'user.ID as userid,' +
      'user.First_Name,' +
      'user.Last_Name ' +
      'FROM `movies` ' +
      'LEFT JOIN `user` ON `movies`.`UserID` = `user`.`ID` ' +
      'LEFT JOIN `studio` ON `movies`.`studioid` = `studio`.`id`'

    // We willen alle query params meenemen in de SQL query, door de key/values in de SQL
    // query toe te voegen. We kunnen de afzonderlijke keys als properties uitlezen, zoals:
    // const studioname = req.query.studio

    // Handiger/mooier:
    // Express levert req.query als een object met key/values, bv { name: 'Pixar', ...: ...}
    // Om te kunnen itereren maken we een array van het object met Object.entries
    const queryParams = Object.entries(req.query)
    // queryParmas is nu een array van arrays: [['name', 'Pixar'], ['...', ''...']]
    // Dit array kunnen we nu via arrayfuncties zoals map() en reduce() doorlopen.
    logger.info('queryParams:', queryParams)
    if (queryParams.length > 0) {
      let queryString = queryParams
        .map((param) => {
          // map maakt een nieuwe waarde van gegeven invoer; hier een string van twee arrayvalues.
          return `${param[0]} = '${param[1]}'`
        })
        .reduce((a, b) => {
          // reduce 'reduceert' twee opeenvolgende waarden tot één eindwaarde.
          return `${a} AND ${b}`
        })
      logger.info('queryString:', queryString)
      sqlQuery += ` WHERE ${queryString};`
    }

    logger.debug('getAll', 'sqlQuery =', sqlQuery)

    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err)
        res.status(400).json({
          message: 'GetAll failed!',
          error: err.toString()
        })
      }
      if (connection) {
        // Use the connection
        // Merk op dat we door de map/reduce aanpaak nu geen prepared statement (met value = ?) hebben!
        // Het zou nog mooier zijn wanneer we dat wél via de map/reduce zouden doen. Dat kan; zoek zelf uit hoe!
        connection.query(sqlQuery, (error, results, fields) => {
          // When done with the connection, release it.
          connection.release()
          // Handle error after the release.
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
                ...item,
                user: {
                  name: item.First_Name + ' ' + item.Last_Name
                }
              }
            })
            res.status(200).json({
              result: mappedResults
            })
          }
        })
      }
    })
  },

  getById(req, res, next) {
    const movieId = req.params.movieId

    logger.info('Get aangeroepen op /api/movie/', movieId)

    let sqlQuery =
      'SELECT ' +
      'movies.id,' +
      'movies.name,' +
      'movies.releaseyear,' +
      'movies.ageCategory,' +
      'movies.inTheatres,' +
      'studio.name as studio,' +
      'studio.id as studioid,' +
      'user.ID as userid,' +
      'user.First_Name,' +
      'user.Last_Name ' +
      'FROM `movies` ' +
      'LEFT JOIN `user` ON `movies`.`UserID` = `user`.`ID` ' +
      'LEFT JOIN `studio` ON `movies`.`studioid` = `studio`.`id` ' +
      'WHERE `movies`.`ID` = ' +
      movieId
    logger.debug('getById', 'sqlQuery =', sqlQuery)

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
                ...item,
                user: {
                  name: item.First_Name + ' ' + item.Last_Name
                }
              }
            })
            res.status(200).json({
              result: mappedResults
            })
          }
        })
      }
    })
  },

  update(req, res, next) {
    // const userid = req.userId
    const id = req.params.movieId
    logger.debug('update', 'id =', id) //, 'userid =', userid)
    res.status(400).json({
      message: 'Not implemented yet!'
    })
  },

  deleteById(req, res, next) {
    const id = req.params.movieId
    const userid = req.userId
    logger.debug('delete', 'id =', id, 'userid =', userid)

    pool.getConnection(function (err, connection) {
      if (err) {
        res.status(400).json({
          message: 'delete failed!',
          error: err
        })
      }

      // Use the connection
      let sqlQuery = 'DELETE FROM movies WHERE id = ? AND UserID = ?'
      connection.query(sqlQuery, [id, userid], (error, results, fields) => {
        // When done with the connection, release it.
        connection.release()
        // Handle error after the release.
        if (error) {
          res.status(400).json({
            message: 'Could not delete item',
            error: error
          })
        }
        if (results) {
          if (results.affectedRows === 0) {
            logger.trace('item was NOT deleted')
            res.status(401).json({
              result: {
                error: 'Item not found of you do not have access to this item'
              }
            })
          } else {
            logger.trace('item was deleted')
            res.status(200).json({
              result: 'successfully deleted item'
            })
          }
        }
      })
    })
  }
}

module.exports = controller

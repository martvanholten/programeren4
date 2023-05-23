const assert = require('assert')
const logger = require('../config/config').logger
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../config/config').jwtSecretKey

module.exports = {
  ValidateEmail(req, res, next) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.emailAdress)){
      logger.info('Eamil is vallid')
      next()
    }else{
      logger.info('Eamil is not vallid')
      res.status(400).json({message: 'error: e-mail is not vallid'})
    }
  },

  ValidatePhone(req, res, next) {
    if (/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(req.body.phoneNumber)){
      logger.info('Phonenumber is vallid')
      next()
    }else{
      logger.info('Phonenumber is not vallid')
      res.status(400).json({message: 'error: phonenumber in not vallid'})
    }
  },

  validateMealRegister(req, res, next) {
    // Verify that we receive the expected input
    console.log("Reached Validation")
    try {
      assert(
        typeof req.body.name === 'string',
        'name must be a string'
      )
      assert(
        typeof req.body.dateTime === 'string',
        'dateTime must be a string'
      )

      assert(
        typeof req.body.imageUrl === 'string',
        'imageUrl must be a string'
      )

      assert(
        typeof req.body.price === 'string',
        'price must be a string'
      )
      console.log("validation completed")
      next()
    } catch (err) {
      console.log('validateRegister error: ', err)
      res
      .status(400)
      .json({ message: err.toString() })
    }
  },
    
  validateUserRegister(req, res, next) {
    // Verify that we receive the expected input
    console.log("Reached Validation")
    try {
      assert(
        typeof req.body.firstName === 'string',
        'firstName must be a string'
      )
      assert(
        typeof req.body.lastName === 'string',
        'lastName must be a string'
      )

      assert(
        typeof req.body.street === 'string',
        'password must be a string'
      )

      assert(
        typeof req.body.city === 'string',
        'password must be a string'
      )

      assert(
        typeof req.body.password === 'string',
        'password must be a string'
      )
      console.log("validation completed")
      next()
    } catch (err) {
      console.log('validateRegister error: ', err)
      res
      .status(400)
      .json({ message: err.toString() })
    }
  },

  validateUserToken(req, res, next) {
    logger.info('validateToken called')
    // logger.trace(req.headers)
    // The headers should contain the authorization-field with value 'Bearer [token]'
    const authHeader = req.headers.authorization
    if (!authHeader) {
      logger.warn('Authorization header missing!')
      res.status(401).json({
        message: 'Authorization header missing!',
        datetime: new Date().toISOString()
      })
    } else {
      // Strip the word 'Bearer ' from the headervalue
      const token = authHeader.substring(7, authHeader.length)
    
      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          logger.warn('Not authorized')
          res.status(401).json({
            message: 'Not authorized',
          })
        }
        if (payload) {
          logger.debug('token is valid', payload)
          // User has acces, add the userId to the user for next use.
          req.userId = payload.userId
          logger.debug(req.userId)
          next()
        }
      })
    }
  }
}
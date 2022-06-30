const assert = require('assert')

module.exports = {
    validateUserLogin(req, res, next) {
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
            .json({ Message: err.toString() })
        }
      },
    
    validateUserRegister(req, res, next) {
        // Verify that we receive the expected input
        console.log("Reached Validation")
        try {
        assert(
            typeof req.body.firstName === 'string',
            'firstName must be a string.'
        )
            assert(
            typeof req.body.lastName === 'string',
            'lastName must be a string.'
        )
        assert(typeof req.body.emailAdress === 'string', 'emailAdress must be a string.')
        assert(
            typeof req.body.password === 'string',
            'password must be a string.'
            )
            console.log("validation completed")
            next()
        } catch (err) {
            console.log('validateRegister error: ', err)
            res
            .status(422)
            .json({ message: err.toString(), datetime: new Date().toISOString() })
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
                Error: 'Not authorized',
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
    }
}
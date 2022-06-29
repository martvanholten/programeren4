!process.env.NODE_ENV ? (process.env.NODE_ENV = 'development') : null

const express = require('express')
const bodyParser = require('body-parser')
const movieroutes = require('./src/routes/movie.routes')
const userroutes = require('./src/routes/users.routes')
const mealroutes = require('./src/routes/meals.routes')
const logger = require('./src/config/config').logger
const pool = require('./src/config/database')

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())

// Add CORS headers
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type,authorization'
  )
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})

app.all('*', (req, res, next) => {
  const method = req.method
  logger.debug('Method: ', method)
  next()
})

app.use('/api', userroutes)
app.use('/api', movieroutes)
app.use('/api', mealroutes)

app.all('*', (req, res, next) => {
  res.status(404).json({
    error: 'Endpoint does not exist!'
  })
})

app.listen(port, () => {
  logger.info(`Server listening at port ${port}`)
  logger.info(`Server running in '${process.env.NODE_ENV}' mode`)
})

module.exports = app

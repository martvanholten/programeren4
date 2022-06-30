const routes = require('express').Router()
const usersController = require('../controllers/users.controller')
const validation = require('../util/validation')

routes.post('/login', validation.validateUserLogin, usersController.login)
routes.post(
  '/register',
  validation.validateUserRegister,
  usersController.register
)
routes.post('/user/alter/:id',validation.validateUserToken, usersController.alter)

routes.get('/users/getall', usersController.getAll)
routes.get('/user/:id', usersController.get)


routes.delete('/user/:id',validation.validateUserToken, usersController.delete)

module.exports = routes

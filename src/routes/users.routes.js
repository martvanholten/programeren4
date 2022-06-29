const routes = require('express').Router()
const UserController = require('../controllers/users.controller')

routes.post('/login', UserController.validateLogin, UserController.login)
routes.post(
  '/register',
  UserController.validateRegister,
  UserController.register
)
routes.get('/validate', UserController.validateToken, UserController.renewToken)

module.exports = routes

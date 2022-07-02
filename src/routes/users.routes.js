const routes = require('express').Router()
const usersController = require('../controllers/users.controller')
const validation = require('../util/validation')

routes.post('/login', validation.ValidateEmail, usersController.login)
routes.post('/register',
  validation.ValidateEmail,
  validation.validateUserRegister,
  usersController.register
)
routes.post('/user/alter/:id',
  validation.validateUserToken, 
  validation.ValidateEmail, 
  validation.ValidatePhone,
  validation.validateUserRegister, 
  usersController.alter)

routes.get('/users/getall', usersController.getAll)
routes.get('/user/:id', validation.validateUserToken, usersController.get)
routes.get('/user/own', validation.validateUserToken, usersController.getOwn)

routes.delete('/user/delete/:id',validation.validateUserToken, usersController.delete)

module.exports = routes

const express = require('express')
const router = express.Router()
const validation = require('../util/validation')
const mealController = require('../controllers/meals.controller')

router.get('/meals/getall', mealController.getAll)
router.get('/meal/:id', mealController.get)

router.post('/meal/register',validation.validateUserToken, mealController.register)
router.post('/meal/alter/:id',validation.validateUserToken, mealController.alter)
router.post('/meal/signon/:id',validation.validateUserToken, mealController.signOn)

router.delete('/meal/signoff/:id',validation.validateUserToken, mealController.signOff)
router.delete('/meal/:id', validation.validateUserToken, mealController.delete)

module.exports = router

const express = require('express')
const router = express.Router()
const validation = require('../util/validation')
const mealController = require('../controllers/meals.controller')

router.get('/meals/getall', mealController.getAll)
router.get('/meal/:id', mealController.get)
router.get('/meal/participate/:id', mealController.getSignup)
router.get('/meal/participate/:id/user/:userId', validation.validateUserToken, mealController.getSignupParticipant)

router.post('/meal/register', validation.validateMealRegister, validation.validateUserToken, mealController.register)
router.post('/meal/alter/:id', validation.validateMealRegister, validation.validateUserToken, mealController.alter)
router.post('/meal/signon/:id',validation.validateUserToken, mealController.signOn)
router.post('/meal/signoff/:id',validation.validateUserToken, mealController.signOff)

router.delete('/meal/delete/:id', validation.validateUserToken, mealController.delete)

module.exports = router

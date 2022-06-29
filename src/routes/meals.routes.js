const express = require('express')
const router = express.Router()
const mealController = require('../controllers/meals.controller')

router.get('/meals', mealController.getAll)

module.exports = router

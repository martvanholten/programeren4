const express = require('express')
const router = express.Router()
const moviecontroller = require('../controllers/movie.controller')
const authcontroller = require('../controllers/users.controller')

// Movie routes
router.post(
  '/movie',
  
  moviecontroller.validateMovie,
  moviecontroller.createMovie
)
router.get('/movie', moviecontroller.getAll)
router.get('/movie/:movieId', moviecontroller.getById)
router.put(
  '/movie/:movieId',
  authcontroller.validateToken,
  moviecontroller.validateMovie,
  moviecontroller.update
)
router.delete(
  '/movie/:movieId',
  authcontroller.validateToken,
  moviecontroller.deleteById
)

module.exports = router

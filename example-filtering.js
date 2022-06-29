const movie = {
  name: 'Finding Nemo',
  releaseyear: 2003,
  studio: 'Pixar'
}

movie.id = 1
movie.name = 'Finding Nemo II'
console.log(updatedMovie)

const updatedMovie = {
  id: 1,
  ...movie,
  name: 'Finding Nemo II'
}

console.log(updatedMovie)

const movielist = [
  {
    name: 'Finding Nemo',
    releaseyear: 2003,
    studio: 'Pixar'
  },
  {
    name: 'Need for Speed II',
    releaseyear: 2007,
    studio: 'Paramount'
  }
]

console.log(movielist)

const filteredlist = movielist.filter((item) => item.studio == 'Paramount')

console.log(filteredlist)

const filteredmovie = filteredlist[0]
filteredmovie.name = 'updated name'

const updatedmovies = [
  ...movielist.filter((item) => item.studio != 'Paramount'),
  filteredmovie
]

console.log('updatedmovies', updatedmovies)

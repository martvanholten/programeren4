require('dotenv').config()

module.exports = {
  dbconfig: {
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    multipleStatements: true,
    host     : process.env.DB_HOST,
    port     : process.env.DB_PORT,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE
  },

  jwtSecretKey: process.env.SECRET,

  logger: require('tracer').console({
    format: ['{{timestamp}} [{{title}}] {{file}}:{{line}} : {{message}}'],
    preprocess: function (data) {
      data.title = data.title.toUpperCase()
    },
    dateformat: 'isoUtcDateTime',
    level: process.env.LOGLEVEL
  })
}

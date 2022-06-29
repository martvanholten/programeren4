const loglevel = process.env.LOGLEVEL || 'trace'

module.exports = {
  dbconfig: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'studenthome_user',
    database: process.env.DB_DATABASE || 'studenthome',
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
    connectionLimit: 10
  },

  jwtSecretKey: process.env.SECRET || 'secret',

  logger: require('tracer').console({
    format: ['{{timestamp}} [{{title}}] {{file}}:{{line}} : {{message}}'],
    preprocess: function (data) {
      data.title = data.title.toUpperCase()
    },
    dateformat: 'isoUtcDateTime',
    level: loglevel
  })
}

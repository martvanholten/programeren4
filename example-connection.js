const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'studenthome_user',
  password: 'secret',
  database: 'studenthome'
})

connection.connect(function (err) {
  if (err) throw err // not connected!
  console.log('connected as id ' + connection.threadId)
})

// Use the connection
connection.query('SELECT * FROM users', function (error, results, fields) {
  if (error) throw error

  console.log('results: ', results)
})

function gracefulShutdown() {
  connection.end((err) => {
    console.log('connection ended')
  })
}

// e.g. kill
process.on('SIGTERM', gracefulShutdown)
// e.g. Ctrl + C
process.on('SIGINT', gracefulShutdown)

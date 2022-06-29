const chai = require('chai')
chai.should()

/**
 * Example of how to pass variables between testcases.
 * In case of database values, you could clear/fill the database
 * in the before function.
 */
describe('This example before() test', () => {
  let value = 0
  before((done) => {
    value = 5
    done()
  })

  it('should pass a value', (done) => {
    value += 3
    value.should.equal(8)
    done()
  })

  it('and then double it', (done) => {
    value = value * 2
    value.should.equal(16)
    done()
  })
})

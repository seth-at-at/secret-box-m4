const assert        = require('chai').assert
const app           = require('../server')
const request       = require('request')
const Secret        = require('../lib/models/secret')
const pry           = require('pryjs')

describe('Server', function(){
  before(function(done){
    this.port = 9876

    this.server = app.listen(this.port, function(err, result){
      if (err) {return done(err) }
      done()
    })

    this.request = request.defaults({
      baseUrl: 'http://localhost:9876/'
    })
  })

  after(function() {
    this.server.close()
  })

  it('should exist', function(){
    assert(app)
  })

  describe('GET /', function(){
    it('should return a 200', function(done){
      request.get('http://localhost:9876', function(error, response){
        if (error) { done(error) } //gives better error messages.
        assert.equal(response.statusCode, 200)
        done()
      })
    })

    it('should return a 200', function(done) {
      this.request.get('/', function(error, response) {
        if (error) { done(error) }
        assert.equal(response.statusCode, 200)
        done()
      })
    })

    it('should have a body with the name of the application', function(done){
      this.request.get('/', function(error, response){
        let title = app.locals.title

        if (error) { done(error) }
        assert.equal(response.body, title)
        done()
      })
    })

    it('should have a body with the name of the application', function(done) {
      let title = app.locals.title

      this.request.get('/', function(error, response) {
        if (error) { done(error) }
        assert(response.body.includes(title),
               `"${response.body}" does not include "${title}".`) //Allows customized error messages.
        done()
      })
    })
  })

  describe('GET /api/secrets/:id', function(){
    this.timeout(100000000)
    beforeEach(function(done) {
      Secret.create("I open bananas from the wrong side")
      .then(function() { done() })
    })

    afterEach(function(done) {
      Secret.destroyAll()
      .then(function() { done() })
    })

    it('should return a 404 if the resource is not found', function(done) {
      this.request.get('/api/secrets/10000', function(error, response) {
        if (error) { done(error) }
        assert.equal(response.statusCode, 404)
        done()
      })
    })

    it('should have the id and message from the resource', function(done) {
      let ourRequest = this.request
      Secret.first()
        .then(function(data){
          let id = data.rows[0].id
          let message = data.rows[0].message
          let created_at = data.rows[0].created_at
          ourRequest.get(`/api/secrets/${id}`, function(error, response) {
            if (error) { done(error) }

            let parsedSecret = JSON.parse(response.body)


            assert.equal(parsedSecret.id, id)
            assert.equal(parsedSecret.message, message)
            assert.ok(parsedSecret.created_at, created_at)
            done()
          })
      })
    })
  })

  describe('POST /api/secrets', function(){
    beforeEach(function() {
      app.locals.secrets = {

      }
    })

    it('should not return 404', function(done) {
      this.request.post('/api/secrets', function(error, response) {
        if (error) { done(error) }
        assert.notEqual(response.statusCode, 404)
        done()
      })
    })

    it('should receive and store data', function(done) {
      let message = {
        message: 'I like pineapples!'
      }

      this.request.post('/api/secrets', {form: message}, function(error, response) {
        if (error) { done(error) }

        let secretCount = Object.keys(app.locals.secrets).length

        assert.equal(secretCount, 1,
                `Expected "1" secret, found "${secretCount}"`)
        done()
      })
    })
  })
})

const express = require('express')
const app = express()
const bodyParser = require('body-parser') //> ability to parse the body of an HTTP request
const md5 = require('md5') //>  unique value based on the content of the message
const Secret = require('./lib/models/secret')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('port', process.env.PORT || 3000)
app.locals.title = 'Secret Box'

app.get('/', function(request, response) {
  response.send(app.locals.title)
})

app.listen(app.get('port'), function() {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`)
});

app.get('/api/secrets/:id', function(request, response) {
  let id = request.params.id
  let message = Secret.find(id)
    .then(function(data){
      if (data.rowCount == 0) { return response.sendStatus(404) }
      var secret = data.rows[0]
      response.json(secret)
    })
})

app.post('/api/secrets', function(request, response) {
  let message = request.body.message

  if (!message) {
    return response.status(422).send({
      error: 'No message property provided'
    })
  } else {
    let id = md5(message)
    app.locals.secrets[id] = message
    response.status(201).json({ id, message })
  }
})

if (!module.parent) {
  app.listen(app.get('port'), function(){
    console.log(`${app.locals.title} is running on ${app.get('port')}`)
  })
}



app.locals.secrets = {
  wowowow: 'I am a banana'
}

module.exports = app

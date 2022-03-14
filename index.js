const express = require('express')
const logger = require('morgan')
require('dotenv').config()

const app = express()
const PersonModel = require('./models/person')

//Helper functions
const loggerMidleware = logger((tokens, req, res) => {
  let logData = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ]
  if(req.method === 'POST')
    logData = logData.concat(JSON.stringify(req.body))
  return logData.join(' ')
})


// Middlewares
app.use(express.static('build'))
app.use(express.json())
app.use(loggerMidleware)

// Endpoints
app.get('/info', (request, response, next) => {
  PersonModel.countDocuments((error, result) => {
    if(error){
      next(error)
    }else{
      const date = new Date()
      response.send(
        `
          <p>Phonebook has info for ${result} peoples</p>
          <p>${date.toString()}</p>
          `
      )
    }
  })
})

app.get('/api/persons', (req, resp, next) => {
  PersonModel.find({})
    .then(persons => {
      resp.json(persons)
    })
    .catch(err => next(err))
})

app.get('/api/persons/:id', (req, resp, next) => {
  PersonModel.findById(req.params.id).then(person => {
    if(person){
      return resp.json(person)
    }
    resp.status(404).end()
  })
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (req, resp, next) => {

  PersonModel.findByIdAndDelete(req.params.id)
    .then(del => {
      if(del)
        return resp.status(204).end()
      resp.status(404).end()
    })
    .catch(err => next(err))
})

app.post('/api/persons', (req, resp, next) => {
  if(!req.body.name || !req.body.number){
    return resp.status(400).json({error: 'Name and number are mandatory.'})
  }
  
  const person = new PersonModel({...req.body})
  person.save()
    .then(p => {
      resp.status(201).json(p)
    })
    .catch(err => next(err))
})

app.put('/api/persons/:id', (request, response, next) => {
  PersonModel.findByIdAndUpdate(request.params.id, request.body, {new: true, runValidators: true, context: 'query'})
    .then(newP => {
      response.status(200).json(newP)
    })
    .catch(err => next(err))
})

const errorHandler = (error, request, response, next) => {
  console.log(error)
  if(error.name === 'CastError'){
    return response.status(400).send({error: 'malformetted id'})
  } else if(error.name === 'ValidationError'){
    return response.status(400).json({error: error.message})
  }
  next(error)
}
app.use(errorHandler)

// Server starting point
const PORT = process.env.PORT || 3001 
app.listen(PORT, () => {
  console.log(`Express backend started at port ${PORT}`)
})

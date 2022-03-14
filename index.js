const express = require('express');
const logger = require('morgan');
require('dotenv').config();

const app = express();
const PersonModel = require('./models/person');

// Data In-memory
/*let  persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]*/

// Middlewares
app.use(express.static('build'))
app.use(express.json())
app.use(logger((tokens, req, res) => {
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
}))

// Helper functions
const generateId = () => {
  return Math.random()
}

// Endpoints
app.get('/info', (request, response) => {
    PersonModel.countDocuments((error, result) => {
      if(error){
        console.log(error);
      }else{
        const date = new Date()
        response.send(
          `
          <p>Phonebook has info for ${result} peoples</p>
          <p>${date.toString()}</p>
          `
        );
      }
    })
})

app.get('/api/persons', (req, resp) => {
  PersonModel.find({})
    .then(persons => {
      resp.json(persons)
    })
})

app.get('/api/persons/:id', (req, resp) => {
  const id = Number(req.params.id)
  PersonModel.findById(req.params.id).then(person => {
    if(person){
      return resp.json(person)
    }
    resp.status(404).end()
  })
  .catch(err => {
    console.log(err);
    resp.status(404).end()
  })
})

app.delete('/api/persons/:id', (req, resp) => {
  const id = Number(req.params.id)
  persons = persons.filter(per => per.id !== id)
  resp.status(204).end()
})

app.post('/api/persons', (req, resp) => {
  if(!req.body.name || !req.body.number){
    return resp.status(400).json({error: 'Name and number are mandatory.'});
  }
  
  const person = new PersonModel({...req.body})
  person.save()
    .then(p => {
      resp.status(201).json(p);
    })
    .catch(err => {
      resp.status(500).json({error: 'Something went wrong. Try later pleace.'})
    })
})

// Server starting point
const PORT = process.env.PORT || 3001 
app.listen(PORT, () => {
  console.log(`Express backend started at port ${PORT}`);
})

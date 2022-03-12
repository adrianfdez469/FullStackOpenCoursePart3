const express = require('express')
const logger = require('morgan');
const app = express()

let  persons = [
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
]

// Middlewares
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

const generateId = () => {
  return Math.random()
}

app.get('/info', (request, response) => {
  const date = new Date()
  response.send(
    `
    <p>Phonebook has info for ${persons.length} peoples</p>
    <p>${date.toString()}</p>
    `
  )
})

app.get('/api/persons', (req, resp) => {
  resp.json(persons)
})

app.get('/api/persons/:id', (req, resp) => {
  const id = Number(req.params.id)
  const person = persons.find(per => per.id === id)
  if(person){
    return resp.json(person)
  }
  resp.status(404).end()
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
  const id = generateId()
  const newPerson = {...req.body, id}
  if(!persons.find(p => p.name === newPerson.name)){
    persons = persons.concat(newPerson);
    return resp.status(201).json(newPerson)
  }
  resp.status(409).json({error: 'Name must be unique.'})
})



const PORT = 3001 
app.listen(PORT, () => {
  console.log(`Express backend started at port ${PORT}`);
})

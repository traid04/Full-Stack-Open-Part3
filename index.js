const express = require('express')
const app = express()
const morgan = require('morgan')
const dotenv = require('dotenv')
const cors = require('cors')
dotenv.config()
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan('tiny', { skip: (req) => req.method === 'POST' }))
morgan.token('data', (req) => JSON.stringify(req.body))

const Person = require('./models/person.js')

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: error.message })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(result => {
      response.json(result)
    })
})

app.get('/info', (request, response) => {
  const date = new Date()
  Person.find({})
    .then(result => {
      response.send(`<p>Phonebook has info for ${result.length} people </p> <p>${date}</p>`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then(result => {
      if (result) {
        response.json(result)
      }
      else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then(result => {
      if (result) {
        response.status(204).end()
      }
      else {
        response.status(404).send({ error: 'This user has already been removed from server' })
      }
    })
    .catch(error => next(error))
})


app.post('/api/persons', morgan(':method :url :status :res[content-length] - :response-time ms :data'), (request, response, next) => {
  const name = request.body.name
  const number = request.body.number
  if (!name && !number) {
    response.status(400).json({ error: 'Both fields are required' })
    return
  }
  else if (!name) {
    response.status(400).json({ error: 'The name field is required' })
    return
  }
  else if (!number) {
    response.status(400).json({ error: 'The number field is required' })
    return
  }
  const newPerson = new Person(request.body)
  Person.findOne({ name })
    .then(result => {
      if (result) {
        response.status(400).json({ error: 'The name must be unique' })
        return
      }
      newPerson.save()
        .then(result => {
          response.status(200).json(result)
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const person = request.body
  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`)
})
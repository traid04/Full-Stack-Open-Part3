const express = require('express');
const app = express();
const morgan = require('morgan');
const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');
dotenv.config();

app.use(express.static('dist'));
app.use(express.json());
app.use(morgan('tiny', {skip: (req, res) => req.method === 'POST'}));
morgan.token('data', (req) => JSON.stringify(req.body));

const Person = require('./models/person.js');

const defineError = (name, number) => {
    Person.find({name})
        .then(result => {
            if (result) {
                return 'The name must be unique';
            }
        })
    if (!name && !number) {
        return 'Both fields are required';
    }
    else if (!name) {
        return 'The name field is required';
    }
    else if (!number) {
        return 'The number field is required';
    }
    return null;
};

app.get('/api/persons', (request, response) => {
    Person.find({})
        .then(result => {
            response.json(result);
        })
});

app.get('/info', (request, response) => {
    const date = new Date();
    Person.find({})
        .then(result => {
            response.send(`<p>Phonebook has info for ${result.length} people </p> <p>${date}</p>`);
        })
});

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    Person.find({_id: id})
        .then(result => {
            if (result) {
                response.json(result);
            }
            else {
                response.status(404).end();
            }
        })
});

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    data = data.filter(person => person.id !== id);
    response.status(204).end();
});


app.post('/api/persons', morgan(':method :url :status :res[content-length] - :response-time ms :data'), (request, response) => {
    const name = request.body.name;
    const number = request.body.number;
    const error = defineError(name, number);

    if (error) {
        response.status(400).json({error: `${error}`});
        return;
    }
    const newPerson = new Person(request.body);
    newPerson.save();
    response.status(200).json(newPerson);
})

app.put('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const number = request.body.number;
    const person = data.find(p => p.id === id);
    if (!person) {
        response.status(404).json({error: 'Information of the person has already been removed from server'})
        return;
    }
    if (!number) {
        return response.status(400).json({error: 'The number field is required'});
    }
    const updatedNumber = {...person, number};
    data = data.map(p => p.id === id ? updatedNumber : p);
    response.status(200).json(updatedNumber);
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`)
})
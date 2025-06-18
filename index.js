const express = require('express');
const app = express();
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

app.use(express.static('dist'));
app.use(express.json());
app.use(morgan('tiny', {skip: (req, res) => req.method === 'POST'}));
morgan.token('data', (req) => JSON.stringify(req.body));

let data = [
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
];

const defineError = (name, number) => {
    const dataError = data.some(person => person.name === name);
    if (!name && !number) {
        return 'Both fields are required';
    }
    else if (!name) {
        return 'The name field is required';
    }
    else if (!number) {
        return 'The number field is required';
    }
    if (dataError) {
        return 'Name must be unique';
    }
    return null;
};

app.get('/api/persons', (request, response) => {
    response.json(data);
});

app.get('/info', (request, response) => {
    const date = new Date();
    response.send(`<p>Phonebook has info for ${data.length} people </p> <p>${date}</p>`);
});

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = data.find(person => person.id === id);
    if (person) {
        response.json(person);
    }
    else {
        response.status(404).end();
    }
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
    const id = Math.floor(Math.random() * 1000000);
    const newPerson = {...request.body, id};
    data = data.concat(newPerson);
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
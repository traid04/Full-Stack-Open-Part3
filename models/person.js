const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const url = process.env.MONGO_URL;
mongoose.set('strict', false);
mongoose.connect(url)
    .then(connect => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.log(error.message);
    });
mongoose.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
})
    
const personSchema = mongoose.Schema({name: String, number: String});

module.exports = mongoose.model('Person', personSchema)
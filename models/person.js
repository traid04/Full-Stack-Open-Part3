const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const url = process.env.MONGO_URL
mongoose.set('strict', false)
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch(error => {
    console.log(error.message)
  })
mongoose.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const personSchema = mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: (v) => {
        return /^\d{2,3}-\d{8,}$/.test(v)
      },
      message: 'The phone number format is invalid'
    },
    required: true
  }
})

module.exports = mongoose.model('Person', personSchema)
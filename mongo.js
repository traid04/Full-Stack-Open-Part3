const mongoose = require('mongoose')
const password = process.argv[2]
const url = `mongodb+srv://database:${password}@cluster1.gk7lyot.mongodb.net/`
mongoose.connect(url)
const personSchema = mongoose.Schema({ name: String, number: String })
const Person = mongoose.model('Person', personSchema)
if (process.argv[3] && process.argv[4]) {
  const newPerson = new Person({ name: process.argv[3], number: process.argv[4] })
  newPerson.save()
    .then(() => {
      console.log(`Added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
      mongoose.connection.close()
    })
}
else if (process.argv.length === 3) {
  Person.find({})
    .then(result => {
      console.log('phonebook:')
      result.forEach(p => console.log(p.name, p.number))
      mongoose.connection.close()
    })
}
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_CON)
  .then(() => {
    console.log("Conected to MongoDB");
  })
  .catch(err => {
    console.log("Error conecting to MongoDB: ", err);
  })

const schema = new mongoose.Schema({
  name: String,
  number: String
}, {collection: 'person'});

schema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

module.exports = mongoose.model('person', schema);
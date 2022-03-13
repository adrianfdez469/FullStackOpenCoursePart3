const monngose = require('mongoose');


if (process.argv.length !== 3 && process.argv.length !== 5) {
  console.log('To insert on the phonebook: node mongo.js <YOURPASSWORD> <PERSON_NAME> <PERSON_PHONE>');
  console.log('To list the phonebook: node mongo.js <YOURPASSWORD>');
  process.exit(1)
}


//const password = process.argv[2];
const [
  , // node
  , // mongo.js
  password, 
  name, 
  number
] = process.argv

const atlasUri = `mongodb+srv://fullstackcourse:${password}@cluster0.b2bac.mongodb.net/fullstackcourse-phonebook?retryWrites=true&w=majority`

monngose.connect(atlasUri)

const personSchema = new monngose.Schema({
  name: String,
  number: String
}, {collection: 'person'})

const PersonModel = monngose.model('person', personSchema);

const person = new PersonModel({
  name, number
})

if(name && number){

  person.save()
    .then(result => {
      console.log(`Added ${result.name} with number ${result.number} to phonebook`);
      return monngose.connection.close(true);
    })
    .catch(err => {
      console.log(err);
      return monngose.connection.close(true);
    })
    .then(() => {
      console.log('Connection closed!');
    });
  } else {
    PersonModel.find({})
      .then(result => {
        console.log('Phonebook:');
        result.forEach(el => {
          console.log(`${el.name} ${el.number}`)
        })
        return monngose.connection.close(true);
      })
      .catch(err => {
        console.log(err);
        return monngose.connection.close(true);
      })
      .then(() => {
        console.log('Connection closed!');
      });
}
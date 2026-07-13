const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de la connexion MongoDB avec l'URI stockée dans le fichier .env.
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/checkpoint-express';

mongoose.connect(mongoUri);

// Schéma Person avec les champs demandés et un validateur simple.
const personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  favoriteFoods: { type: [String], default: [] }
});

const Person = mongoose.model('Person', personSchema);

// Fonctions de démonstration pour respecter les étapes demandées.
async function createAndSavePerson() {
  const person = new Person({
    name: 'Alice',
    age: 30,
    favoriteFoods: ['pizza', 'sushi']
  });

  const data = await person.save();
  console.log('Personne créée et sauvegardée :', data);
  return data;
}

async function createManyPeople(arrayOfPeople) {
  const people = await Person.create(arrayOfPeople);
  console.log('Plusieurs personnes créées :', people);
  return people;
}

async function findPeopleByName(name) {
  const people = await Person.find({ name });
  console.log('Recherche par nom :', people);
  return people;
}

async function findPersonByFood(food) {
  const person = await Person.findOne({ favoriteFoods: food });
  console.log('Recherche par aliment favori :', person);
  return person;
}

async function findPersonById(personId) {
  const person = await Person.findById(personId);
  console.log('Recherche par _id :', person);
  return person;
}

async function updatePersonById(personId) {
  const person = await Person.findById(personId);
  person.favoriteFoods.push('hamburger');
  const updatedPerson = await person.save();
  console.log('Personne mise à jour avec hamburger :', updatedPerson);
  return updatedPerson;
}

async function updatePersonByName(personName) {
  const updatedPerson = await Person.findOneAndUpdate(
    { name: personName },
    { age: 20 },
    { new: true }
  );
  console.log('Personne mise à jour via findOneAndUpdate :', updatedPerson);
  return updatedPerson;
}

async function removePersonById(personId) {
  const removedPerson = await Person.findByIdAndDelete(personId);
  console.log('Personne supprimée par _id :', removedPerson);
  return removedPerson;
}

async function removePeopleByName(name) {
  const result = await Person.deleteMany({ name });
  console.log('Suppression multiple par nom :', result);
  return result;
}

async function findPeopleWhoLoveBurritos() {
  const data = await Person.find({ favoriteFoods: 'burritos' })
    .sort('name')
    .limit(2)
    .select('-age')
    .exec();
  console.log('Personnes aimant les burritos :', data);
  return data;
}

async function runMongoExercises() {
  try {
    // Étape 1 : créer et sauvegarder une personne.
    await createAndSavePerson();

    // Étape 2 : créer plusieurs personnes avec Model.create().
    const arrayOfPeople = [
      { name: 'John', age: 25, favoriteFoods: ['burrito', 'tacos'] },
      { name: 'Mary', age: 18, favoriteFoods: ['salad', 'fruit'] },
      { name: 'Bob', age: 35, favoriteFoods: ['burger', 'fries'] }
    ];

    await createManyPeople(arrayOfPeople);

    // Étape 3 : rechercher les personnes par nom.
    await findPeopleByName('John');

    // Étape 4 : retrouver une seule personne qui aime un aliment.
    await findPersonByFood('salad');

    // Étape 5 : rechercher une personne par _id.
    const firstPerson = await Person.findOne({});
    if (!firstPerson) {
      console.log('Aucune personne trouvée pour la suite des opérations.');
      return;
    }

    const personId = firstPerson._id;

    // Étape 6 : mise à jour classique via find puis save().
    await updatePersonById(personId);

    // Étape 7 : mise à jour via findOneAndUpdate().
    await updatePersonByName('John');

    // Étape 8 : suppression par _id.
    await removePersonById(personId);

    // Étape 9 : suppression de plusieurs documents.
    await removePeopleByName('Mary');

    // Étape 10 : enchaînement de requêtes.
    await findPeopleWhoLoveBurritos();
  } catch (err) {
    console.error('Erreur MongoDB :', err);
  }
}

function workingHours(req, res, next) {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  const isWorkDay = day >= 1 && day <= 5;
  const isWorkHour = hour >= 9 && hour < 17;

  if (isWorkDay && isWorkHour) {
    return next();
  }

  res.status(503).render('closed', {
    message: 'Nous sommes fermés en dehors des heures de bureau. Merci de revenir du lundi au vendredi entre 9h et 17h.'
  });
}

app.use(workingHours);

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Accueil',
    page: 'home'
  });
});

app.get('/services', (req, res) => {
  res.render('services', {
    title: 'Nos services',
    page: 'services'
  });
});

app.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Nous contacter',
    page: 'contact'
  });
});

app.use((req, res) => {
  res.status(404).render('not-found', {
    title: 'Page non trouvée',
    page: ''
  });
});

mongoose.connection.on('open', async () => {
  console.log('Connexion MongoDB ouverte.');
  await runMongoExercises();
});

mongoose.connection.on('error', (err) => {
  console.error('Erreur de connexion MongoDB :', err);
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});

const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

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

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});

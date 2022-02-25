require('dotenv').config();
//console.log(process.env);
// import express
const express = require('express');
// install helmet
const helmet = require('helmet');
// installation Cors
const cors = require('cors');
// limiter les requêtes
const rateLimit = require('express-rate-limit');
// import ORM ?
// import path du serveur ?
// import routeurs 
const apiRouter = require('./apiRouter').router;
// connextion avec la BDD ?

// Propriété de rateLimit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15min
    max: 80, // limite chaque IP à 80 requêtes par 15min
    standardHeaders: true, // retourne l'info dans les headers
    legacyHeaders: false // désactive le 'X-rateLimit-*' headers
});

// appel de la méthode express
const app = express();
app.use(helmet());
app.use(cors());
app.use(limiter);

// config route

// gestion cors à modifier selon routes ? comment savoir si headers correctement config ?
app.get('/gifs/:id', function (req, res, next) {
    res.json({msg : 'Cors mis en oeuvre pour toutes les origines !'})
});
app.get('/', function (req, res) {
    res.status(200).send('<h1>Bonjour sur mon super serveur</h1>');
});

// QUESTION : faut-il ajouter ceci ? est-ce au bon endroit ?
// app.listen(80, function () {
//     console.log('CORS-enabled web server listening on port 80')
//   })

// json.parse
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// fichiers gifs
// route utilisateurs avec auth
// route gifs 
// autre routes ?
app.use('/api/', apiRouter);


module.exports = app;
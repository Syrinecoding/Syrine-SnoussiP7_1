// imports
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
// Verifier si dans model il faut indiquer id ?

// middleware signup
exports.signup = (req, res, next) => {
    // crypter le mdp 
    bcrypt.hash(req.body.password, 10)
        // fonction asynchrone
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            //verifier email regex etc
            user.save()
                .then(()=> res.status(201).json({ message: 'Utilisateur créé !'}))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error}));
};

// middleware login
exports.login = (req, res) => {
    //trouver l'utilisateur dans la bdd
    User.findOne({ email: req.body.email })
    .then(user => {
        //verifi si trouvé ou non
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé !'});
        }
        // comparer le mdp avec le hash
        bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                // boolean si pas valide erreur
                if(!valid) {
                    return res.status(401).json({ error: 'Mot de passe incorrect !'});
                }
                res.status(200).json({
                    userId: user._id, //verifier si _ ?
                    // verifier le token à chaque fois
                    token: jwt.sign(
                        { userId: user._id},
                        process.env.MY_TOKEN_KEY,
                        { expiresIn: '24h'}
                    )   
                });
            })
            .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
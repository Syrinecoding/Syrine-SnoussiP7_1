// imports
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const models = require('../models');
// Verifier si dans model il faut indiquer id ?

// Routes
module.exports = {
    signup: function(req, res) {

        // Params
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const bio = req.body.bio;

        if (email == null || username == null || password == null) {
            return res.status(400).json({'error': 'Paramètres manquants !'});
        }
        // TODO verifi mail pseudo regex password etc
        models.User.findOne({
            attributes: ['email'],
            where: { email: email}
        })
        .then(function(userFound) {
            if (!userFound) {
                bcrypt.hash(password, 5, function( err, bcryptPassword){
                    const newUser = models.User.create({
                        email: email,
                        username: username,
                        password: bcryptPassword,
                        bio: bio,
                        isAdmin: 0
                    })
                    .then(function(newUser){
                        return res.status(201).json({
                            'userId': newUser.id
                        })
                    })
                    .catch(function(err){
                        return res.status(500).json({ 'error': "Impossible d'ajouter l'utilisateur !"})
                    });
                });
            } else {
                return res.status(409).json({ 'error': "Cet utilisateur est déjà inscrit !"});
            }
        })
        .catch(function(err){
            return res.status(500).json({'error': "impossible de vérifier l'utilisateur !"});
        }); 
    },

    login: function(req, res) {

    }
}



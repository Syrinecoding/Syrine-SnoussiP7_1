// imports
const bcrypt = require('bcrypt');
const jwtUtils = require('../utils/jwt.utils')
const models = require('../models');
const asyncLib = require('async');
// Verifier si dans model il faut indiquer id ?
let emailRegex = new RegExp ('^[a-zA-Z0-9.-_]+[@]{1}[a-zA-Z0-9.-_]+[.]{1}[a-z]{2,15}$', 'g');
let passwordRegex = new RegExp('/^[a-zA-Z]\w{3,14}$/');
// Routes
module.exports = {
    signup: function(req, res) {
        // Params
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const bio = req.body.bio;
        // verifications (TODO : les regex à verifier ? ou utiliser express validator ?)
        if (email == null || username == null || password == null) {
            return res.status(400).json({'error': 'Paramètres manquants !'});
        }
        if (username.length >= 16 || username <= 4) {
            return res.status(400).json({
                'error': "mauvais nom d'utilisateur (le nombre de caractères doit être compris entre 3 et 15"
            })
        }
        if (!emailRegex.test(email)){
            return res.status(400).json({
                'error': "l'email n'est pas valide !"
            });
        }
        if (!passwordRegex.test(password)){
            return res.status(400).json({
                'error': "le mot de passe n'est pas valide (La première lettre doit être une lettre, entre 4 et 15 caractères, aucun caractère spécial) !"
            });
        }
        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    attributes: ['email'],
                    where: { email: email}
                })
                .then(function(userFound) {
                    done(null, userFound);
                })
                .catch(function(err){
                    return res.status(500).json({'error': "impossible de vérifier l'utilisateur !"});
                }); 
            },  
            function(userFound, done){
                if (!userFound) {
                    bcrypt.hash(password, 5, function(err, bcryptPassword){
                        done(null, userFound, bcryptPassword);
                    });
                } else {
                    return res.status(409).json({ 'error': "Cet utilisateur est déjà inscrit !"});
                }
            },
            function(userFound, bcryptPassword, done) {
                const newUser = models.User.create({
                    email: email,
                    username: username,
                    password: bcryptPassword,
                    bio: bio,
                    isAdmin: 0
                })
                .then(function(newUser){
                    done(newUser);
                })
                .catch(function(err){
                    return res.status(500).json({ 'error': "Impossible d'ajouter l'utilisateur !"})
                });
            }
        ], function(newUser) {
            if (newUser) {
                return res.status(201).json({
                    'userId': newUser.id
                });
            } else {
                return res.status(500).json({'error': "Impossible d'ajouter cet utilisateur !"});
            }
        }); 
    },

    login: function(req, res) {
        // Params
        const email = req.body.email;
        const password = req.body.password;

        if(email == null || password == null) {
            return res.status(400).json({ 'error': 'paramètre manquant !' });
        }
        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    where: { email: email }
                })
                .then(function(userFound){
                    done(null, userFound);
                })
                .catch(function(err){
                    return res.status(500).json({ 'error': 'Impossible de vérifier cet utilisateur !'});
                });
            },
            function(userFound, done) {
                if (userFound){
                    bcrypt.compare(password, userFound.password, function(errBcrypt, resBcrypt){
                        done(null, userFound, resBcrypt);
                    });
                } else {
                    return res.status(404).json({'error': "Cet utilisateur n'existe pas dans la base !"});
                }  
            },
            function(userFound, resBcrypt, done) {
                if(resBcrypt) {
                    done(userFound);
                } else {
                    return res.status(403).json({"error": "mot de passe invalide !"});
                }
            }
        ], function(userFound) {
            if (userFound) {
                return res.status(201).json({
                    'userId': userFound.id,
                    'token': jwtUtils.generateToken(userFound)
                });         
            } else {
                return res.status(500).json({ 'error': "Impossible de connnecter l'utilisateur !" });
            }
        });
    },
    getUserProfile: function(req, res) {
        // recup entête auth
        const autHeader = req.headers['authorization'];
        const userId = jwtUtils.getUserId(autHeader);

        if (userId < 0)
        return res.status(400).json({'error': 'mauvais token !'});

        models.User.findOne({
            attributes: ['id', 'email', 'username', 'bio' ],
            where: { id: userId}
        }).then(function(user){
            if(user) {
                res.status(201).json(user);
            } else {
                res.status(404).json({'error': 'Utilisateur introuvable !'});
            }
        }).catch(function(err) {
            res.status(500).json({'error': "impossible de trouver l'utilisateur !"});
        });
    },
    updateUserProfile: function(req, res) {
        //Récupéer les requêtes d'autorisation
        const autHeader = req.headers['authorization'];
        const userId = jwtUtils.getUserId(autHeader);

        // params
        const bio = req.body.bio;

        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    attributes: ['id', 'bio'],
                    where: { id: userId }
                }).then(function(userFound) {
                    done(null, userFound);
                }).catch(function(err) {
                    return res.status(500).json({ 'error': "Impossible de vérifier l'utilisateur !" });
                });
            },
            function(userFound, done) {
                if(userFound) {
                    userFound.update({
                        bio: (bio ? bio : userFound.bio)
                    }).then(function() {
                        done(userFound);
                    }).catch(function(err) {
                        res.status(500).json({ 'error': "Impossible de mettre à jour l'utilisateur !" });
                    });
                } else {
                    res.status(404).json({ 'error': 'Utilisateur introuvable !'});
                }
            },
        ], function(userFound) {
            if (userFound) {
                return res.status(201).json(userFound);
            } else {
                return res.status(500).json({ 'error' : "Impossible de mettre à jour le profil Utilisateur !"})
            }
        });
    }
}



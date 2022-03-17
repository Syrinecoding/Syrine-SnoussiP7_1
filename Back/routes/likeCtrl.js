const models = require('../models');
const jwtUtils = require('../utils/jwt.utils');
const asyncLib = require('async');

const DISLIKED = 0;
const LIKED = 1;

// routes
module.exports = {
    likePost: function (req, res) {
        // recup requete auth
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth);
        // params
        const messageId = parseInt(req.params.messageId);
        //verifier que le message existe
        if (messageId <= 0) {
            return res.status(400).json({ 'error': 'paramètres invalides !'});
        }
        asyncLib.waterfall([
            function(done) {
                models.Message.findOne({
                    where: { id: messageId}
                })
                .then(function(messageFound){
                    done(null, messageFound);
                })
                .catch(function(err) {
                    return res.status(500).json({'error': 'impossible de vérifier le message'});
                });
            },
            function(messageFound, done) {
                if(messageFound) {
                    models.User.findOne({
                        where: { id: userId }
                    })
                    .then(function(userFound) {
                        done(null, messageFound, userFound);
                    })
                    .catch(function(err){
                        return res.status(500).json({'error': "impossible de vérifier l'utilisateur" });
                    });
                } else {
                    res.status(404).json({ 'error': 'post déjà liké !'});
                }
            },function(messageFound, userFound, done) {
                if(userFound) {
                    models.Like.findOne({
                        where: {
                            userId: userId,
                            messageId: messageId
                        }
                    })
                    .then(function(hasUserAlreadyLiked) {
                        done(null, messageFound, userFound, hasUserAlreadyLiked);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': "impossible de vérifier si l'utilisateur a déjà liké !" });
                    });
                } else {
                    res.status(404).json({ 'error': "l'utilisateur n'existe pas ! "});
                }
            },
            function(messageFound, userFound, hasUserAlreadyLiked, done) {
                if(!hasUserAlreadyLiked) {
                    messageFound.addUser(userFound, { hasLiked: LIKED })
                    .then(function(alreadyLiked) {
                        done(null, messageFound, userFound); // + hasUserAlreadyLiked ?
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': "impossible d'indiquer la réaction de l'utilisateur !" });
                    });
                } else {
                    if (hasUserAlreadyLiked.hasLiked === DISLIKED) {
                        hasUserAlreadyLiked.update({
                            hasLiked: LIKED,
                        }).then(function() {
                            done(null, messageFound, userFound);
                        }).catch(function(err) {
                            res.status(500).json({ 'error': "impossible de mettre à jour la réaction de l'utilisateur ! " });
                        });
                    } else {
                        res.status(409).json({ 'error': 'message déjà liké !'});
                    }                   
                }
            },
            function(messageFound, userFound, done) {
                messageFound.update({
                    likes: messageFound.likes + 1,
                }).then(function() {
                    done(messageFound);
                }).catch(function(err) {
                    res.status(500).json({'error': "impossible de mettre à jour le compteur de likes !" });
                });
            },
        ], function(messageFound){
            if(messageFound) {
                return res.status(201).json(messageFound);
            } else {
                return res.status(500).json({ 'error': 'impossible de mettre à jour le message !'});
            }

        });
    }, 
    dislikePost: function(req, res) {
        // récupéer le header auth
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth);
        // params
        const messageId = parseInt(req.params.messageId);

        if(messageId <= 0) {
            return res.status(400).json({ 'error': 'paramètres invalides !'});
        }
        asyncLib.waterfall([
            function(done) {
                models.Message.findOne({
                    where: { id: messageId }
                })
                .then(function(messageFound) {
                    done(null, messageFound);
                })
                .catch(function(err) {
                    return res.status(500).json ({ 'error': "impossible de vérifier le message ! "});
                });
            },
            function(messageFound, done) {
                if(messageFound) {
                    models.User.findOne({
                        where: { id: userId } 
                    })
                    .then(function(userFound){
                        done(null, messageFound, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': "impossible de vérifier l'utilisateur ! "});
                    });
                } else {
                    res.status(404).json({ 'error': 'le post a déjà été liké ! '});
                }
            },
            function(messageFound, userFound, done) {
                if(userFound) {
                    models.Like.findOne({
                        where: {
                            userId: userId,
                            messageId: messageId
                        }
                    })
                    .then(function(hasUserAlreadyLiked) {
                        done(null, messageFound, userFound, hasUserAlreadyLiked);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': "impossible de vérifier si l'utilisateur a déjà liké ! "});
                    });
                } else {
                    res.status(404).json({ 'error': "l'utilisateur n'existe pas ! "});
                }
            },
            function(messageFound, userFound, hasUserAlreadyLiked, done) {
                if(!hasUserAlreadyLiked) {
                    messageFound.addUser(userFound, { hasLiked: DISLIKED })
                    .then(function(alreadyLiked) {
                        done(null, messageFound, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': "impossible de supprimer le like ! "});
                    });
                } else {
                    if(hasUserAlreadyLiked.hasLiked === LIKED) {
                        hasUserAlreadyLiked.update({
                            hasLiked: DISLIKED,
                        }).then(function() {
                            done(null, messageFound, userFound);
                        }).catch(function(err) {
                            res.status(500).json({ 'error': "Impossible de mettre à jour la réaction de l'utilisateur !" });
                        });
                    } else {
                        res.status(409).json({ 'error': 'message déjà mis à jour !' });
                    }
                }
            },
            function(messageFound, userFound, done) {
                messageFound.update({
                    likes: messageFound.likes - 1,
                }).then(function() {
                    done(messageFound);
                }).catch(function(err) {
                    res.status(500).json({ 'error': 'impossible de mettre à jour le compte de like !' });
                });
            },
        ], function(messageFound) {
            if (messageFound) {
                return res.status(201).json(messageFound);
            } else {
                return res.status(500).json({ 'error': 'impossible de mettre à jour le message !' });
            }
        });
    }
    
}
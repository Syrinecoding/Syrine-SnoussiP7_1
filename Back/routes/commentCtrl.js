const models = require('../models');
const asyncLib = require('async');
const jwtUtils = require('../utils/jwt.utils');

module.exports = {
    getComments: function(req, res) {
        const messageId = req.params.messageId;

        models.Comment.findAll({ 
            where: { messageId: messageId }
        }).then(function(comments) {
            res.status(200).json(comments);
        }).catch(function(err) {
            res.status(500).json({'error': 'Champs invalides !'});
        })
    },
    createComment: function(req, res) {
        const autHeader = req.headers['authorization'];
        const userId = jwtUtils.getUserId(autHeader);
        //const comment = req.body;
        const messageId = req.params.messageId;
        const commentText = req.body.commentText;
        if (messageId <= 0) {
            return res.status(400).json({'error': 'paramètres invalides !'});
        }
        asyncLib.waterfall([
            function(done) {
                models.Message.findOne({
                    where : { messageId: messageId }
                })
                .then(function(messageFound) {
                    done(null, messageFound);
                })
                .catch(function(err) {
                    return res.status(500).json({'error': "impossible de vérifier le message !"});
                });
            },
            function(messageFound, done) {
                if(messageFound) {
                    models.User.findOne({
                        where: { id: userId }
                    })
                    .then(function(err) {
                        return res.status(500).json({'error': "impossible de vérifier l'utilisateur !"});
                    });
                } else {
                    res.status(404).json({'error': 'message introuvable'})
                }
            },
            function(messageFound, userFound, done) {
                if(messageFound) {
                    models.Comment.create({
                        commentText: commentText,
                    })
                    .then(function(newComment) {
                        done(newComment)
                    })
                } else {
                    res.status(404).json({'error': 'message introuvable'});
                }
            }
        ], function(newComment) {
            if (newComment) {
                return res.status(201).json(newComment);
            } else {
                return res.status(500).json({'error': 'impossible de poster un nouveau commentaire !'});
            }
        });
    }
}
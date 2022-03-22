// importer
const models = require('../models');
const asyncLib = require('async');
const jwtUtils = require('../utils/jwt.utils');
const fs = require('fs');
const { title } = require('process');
const { measureMemory } = require('vm');

const titleMin = 2;
const contentMin = 4;

// Routes
module.exports = {
    createMessage: function(req, res) {
        // recup entête auth
        const autHeader = req.headers['authorization'];
        const userId = jwtUtils.getUserId(autHeader);

        // paramètres
        const title = req.body.title;
        const content = req.body.content;
        

        if(title == null || content == null) {
            return res.status(400).json({ 'error': 'Paramètre manquant !' });
        }
        
        if (title.length <= titleMin || content.length <= contentMin) {
            return res.status(400).json({ 'error': 'paramètres non valides !'});
        }
        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    where: { id: userId }
                })
                .then(function(userFound) {
                    done(null, userFound);
                })
                .catch(function(err) {
                    return res.status(500).json({ 'error': "Impossible de vérifier l'utilisateur !" });
                });
            },
            function(userFound, done) {
                if(userFound) {
                    models.Message.create({
                        title : title,
                        content : content,
                        //gifsAttached : null,
                        gifsAttached : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
                        likes : 0,
                        UserId : userFound.id
                    })
                    .then(function(newMessage) {
                        done(newMessage);
                    })
                } else {
                    res.status(404).json({'error': 'Utilisateur introuvable !'});
                }
            },
        ], function(newMessage) {
            if (newMessage) {
                return res.status(201).json(newMessage);
            } else {
                return res.status(500).json( { 'error': 'Impossible de poster le message !' });
            }
        });
    },
    listMessages: function(req, res) {
        const fields = req.query.fields;
        const limit = parseInt(req.query.limit);
        const offset = parseInt(req.query.offset);
        const order = req.query.order;

        models.Message.findAll({
            order: [(order != null) ? order.split(':') : ['title', 'ASC']],
            attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
            limit: (!isNaN(limit)) ? limit : null,
            offset: (!isNaN(offset)) ? offset : null,
            include : [{
                model: models.User,
                attributes: [ 'username' ]
            }]
        }).then(function(messages) {
            if (messages) {
                res.status(200).json(messages);
            } else {
                res.status(404).json({ "error": "Aucun message trouvé !"});
            }
        }).catch(function(err) {
            console.log(err);
            res.status(500).json({ 'error': "Champs invalides !"});
        });
    },
    findMessageById: function (req, res) {
        //params
        const messageId = parseInt(req.params.messageId);

        models.Message.findOne({
            where: { id: messageId }
        })
        .then(function(messageFound){
            if (messageFound) {
                res.status(200).json(messageFound);
            } else (
                res.status(404).json({'error': 'message introuvable !'})
            )
        })
        .catch(function(err) {
            res.status(500).json({'error': 'champs non valides !'});
        });
    },
    
}

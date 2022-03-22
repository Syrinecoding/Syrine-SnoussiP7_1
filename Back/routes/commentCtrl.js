const models = require('../models');

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
        const comment = req.body;

        models.Comment.create(comment)
        .then(function(comment){
            res.status(201).json(comment);
        })
        .catch(function(err){
            res.status(500).json({'error': 'impossible de commenter !'});
        });
    }
}
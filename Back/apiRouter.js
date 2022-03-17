const express = require('express');
const usersCtrl = require('./routes/usersCtrl');
const messageCtrl = require('./routes/messagesCtrl');
const likeCtrl = require('./routes/likeCtrl');

exports.router = (function() {
    const apiRouter = express.Router();
    // Routes Users
    apiRouter.route('/users/signup/').post(usersCtrl.signup);
    apiRouter.route('/users/login/').post(usersCtrl.login);
    apiRouter.route('/users/profile/').get(usersCtrl.getUserProfile);
    apiRouter.route('/users/profile/').put(usersCtrl.updateUserProfile);
    // Routes Messages
    apiRouter.route('/messages/new/').post(messageCtrl.createMessage);
    apiRouter.route('/messages/').get(messageCtrl.listMessages);
    // Route Likes
    apiRouter.route('/messages/:messageId/vote/like').post(likeCtrl.likePost);
    apiRouter.route('/messages/:messageId/vote/dislike').post(likeCtrl.dislikePost);

    return apiRouter;
})();
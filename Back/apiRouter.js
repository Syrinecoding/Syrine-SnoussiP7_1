const express = require('express');
const usersCtrl = require('./routes/usersCtrl');
const messageCtrl = require('./routes/messagesCtrl');

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
    return apiRouter;
})();
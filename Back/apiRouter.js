const express = require('express');
const usersCtrl = require('./routes/usersCtrl');

exports.router = (function() {
    const apiRouter = express.Router();

    apiRouter.route('/users/signup/').post(usersCtrl.signup);
    apiRouter.route('/users/login/').post(usersCtrl.login);
    apiRouter.route('/users/profile/').get(usersCtrl.getUserProfile);
    apiRouter.route('/users/profile/').put(usersCtrl.updateUserProfile);

    return apiRouter;
})();
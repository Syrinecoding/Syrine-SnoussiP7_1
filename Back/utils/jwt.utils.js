const jwt = require('jsonwebtoken');


module.exports = {
    generateToken: function(userData) {
        return jwt.sign({
            userId: userData.id,
            isAdmin: userData.isAdmin
        },
        process.env.JWT_SIGN_SECRET,
        {
            expiresIn: '1h'
        })
    }
}
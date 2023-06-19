const jwt = require('jsonwebtoken');
const User = require('../db/users');

//Authenticating using JWT token in each client request that needs to be authenticated.
const auth = async (req, res, next) => {
    try {

        if(!req.get('Authorization') || !req.get('Authorization').startsWith('Bearer ')) {
            throw new Error();
        }

        const token = req.get('Authorization').replace('Bearer ', '');
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const authUser = await User.findById(decodedPayload._id);
        
        if (!authUser) {
            throw new Error();
        };

        req.user = authUser;
        req.token = token;

        next();

    } catch (error) {
        error.status = 401;
        error.message = 'please authenticate properly';
        next(error);
    }
}

module.exports = auth;
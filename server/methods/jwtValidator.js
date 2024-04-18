const jwt = require('jsonwebtoken')

const SECRET_KEY = 'vgvsvTGusrlx2jdZi7oVVDQBtTjlOO6j';


class JSON_WEB_TOKEN{
    createPayload(userId,username,email){
        return {
            userId: userId,
            username: username,
            email: email
        }
    }

    createToken(payload){
        return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' })
    }

    validateUserToken(userToken){
        try {
            const decodedToken = jwt.verify(userToken, SECRET_KEY);
            console.log(decodedToken);
            if (decodedToken.exp < Math.floor(Date.now() / 1000)) {
                return { valid: false, reason: 'Token has expired' };
            }
            return { valid: true, decodedToken: decodedToken };
        } catch (error) {
            return { valid: false, reason: 'Invalid token: ' + error.message };
        }
    }

}

module.exports = JSON_WEB_TOKEN;
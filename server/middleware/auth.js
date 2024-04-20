const JSON_WEB_TOKEN = require('../methods/jwtValidator')
const Logger = require('../methods/logger')

const authenticationMiddleware = async(req, res, next)=>{
    if(!req.cookies.userToken){
        console.log("userToken does not exist")
        res.status(400).send({error:"user Token does not exists"})
    }
    const validator = new JSON_WEB_TOKEN();

    const validateJTW = validator.validateUserToken(req.cookies.userToken)
    if(!validateJTW['valid']){
        console.log("Invalid JWT");
        res.status(400).send({error:validateJTW['reason']})
    }

    //console.log('JWT Validated ',req.cookies.userToken)

    const decodedToken = validateJTW['decodedToken'];
    const {username, email} = decodedToken;

    const logger = new Logger();
    const log = {
        username:username,
        email:email,
        req_URL:req.originalUrl,
    }

    logger.logRoute(log);

    next();
}


module.exports = authenticationMiddleware
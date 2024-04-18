const express = require('express')
const cookieParser = require('cookie-parser')
const auth_router = express.Router()
const { v4:uuidv4 } = require('uuid');
const Validator = require('../methods/validator')
const JSON_WEB_TOKEN = require('../methods/jwtValidator')
auth_router.use(cookieParser());

auth_router.post('/signup',(req,res)=>{
    const name = req.body['name'];
    const username = req.body['username'];
    const email = req.body['email'];
    const password = req.body['password'];
    const validator = new Validator();
    
    if(!validator.validateName(name)){
        return res.status(400).send("Invalid Name");
    }

    if(!validator.validateUsername(username)){
        return res.status(400).send("Invalid Username");
    }

    if(!validator.validateEmail(email)){
        return res.status(400).send("Invalid Email");
    }

    if(!validator.validatePassword(password)){
        return res.status(400).send("Invalid Password");
    }

    const uid = uuidv4();

    const jsonWebToken = new JSON_WEB_TOKEN();
    const userToken = jsonWebToken.createToken(jsonWebToken.createPayload(uid,name, email));

    res
    .cookie( 'userToken' , userToken ,{ httpOnly:true })
    .setHeader('Content-Type', 'application/json')
    .status(201)
    .json({
        success: "Signup completed",
        user: {
            id: uid,
            name: name,
            email: email
        },
        userToken: userToken
    });
;
})


auth_router.get('/verifyUserToken',(req,res)=>{
    const userToken =  req.query['userToken'];;
    const jsonWebToken = new JSON_WEB_TOKEN();

    if (!userToken) {
        return res.status(400).send("User token is missing");
    }

    const validation = jsonWebToken.validateUserToken(userToken);

    if(validation.valid){
        return res.status(200).json(validation);
    }
    else{
        return res.status(400).json(validation);
    }

})

module.exports = auth_router
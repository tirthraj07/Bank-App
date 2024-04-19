const express = require('express')
const cookieParser = require('cookie-parser')
const auth_router = express.Router()
const { v4:uuidv4 } = require('uuid');
const Validator = require('../methods/validator')
const JSON_WEB_TOKEN = require('../methods/jwtValidator')
const SupabaseDB = require('../methods/supabase')
const { c } = require('tar');
auth_router.use(cookieParser());

auth_router.post('/signup', async (req,res)=>{
    const name = req.body['name'];
    const username = req.body['username'];
    const email = req.body['email'];
    const password = req.body['password'];
    const validator = new Validator();

    console.log(name,username,email,password);

    // Check if the username, password, email and name are valid entries

    if(!validator.validateName(name)){
        return res.status(400).send({"error":"Invalid Name"});
    }

    if(!validator.validateUsername(username)){
        return res.status(400).send({"error":"Invalid Username"});
    }

    if(!validator.validateEmail(email)){
        return res.status(400).send({"error":"Invalid Email"});
    }

    if(!validator.validatePassword(password)){
        return res.status(400).send({"error":"Invalid Password"});
    }

    // check if username or email exists in the database

    database = new SupabaseDB();

    let data = await database.query("users","username",`${username}`);

    console.log("Result for username: ", data);

    if(!data['success']){
        return res.status(500).send({"error":data['reason']})
    }

    if(data['success']&&data['result'].length!=0){
        return res.status(400).send({"error":"username already exists"})
    }

    data = await database.query("users","email",`${email}`);

    console.log("Result for email: ", data);

    if(!data['success']){
        return res.status(500).send({"error":data['reason']})
    }

    if(data['success']&&data['result'].length!=0){
        return res.status(400).send({"error":"email already exists"})
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
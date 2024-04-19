const express = require('express')
const cookieParser = require('cookie-parser')
const auth_router = express.Router()
const { v4:uuidv4 } = require('uuid');
const Validator = require('../methods/validator')
const JSON_WEB_TOKEN = require('../methods/jwtValidator')
const SupabaseDB = require('../methods/supabase')
const Cryptography = require('../methods/cryptoAlgo')

const CIPHER_KEY = "f8f1f5aac82f7d160906412074f3b8e5";

auth_router.use(cookieParser());

auth_router.post('/signup', async (req,res)=>{
    /* 
        Fetch the user info from the body
    */
    const name = req.body['name'];
    const username = req.body['username'];
    const email = req.body['email'];
    const password = req.body['password'];
    const validator = new Validator();

    console.log("New Signup Request: ",name,username,email,password);

    /* 
        Check if the username, password, email and name are valid entries using Regex
    */

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

    /* 
        Check if username or email exists in the database
    */

    database = new SupabaseDB();

    let data = await database.query("users","username",`${username}`);

    //console.log("Result for username: ", data);

    if(!data['success']){
        return res.status(500).send({"error":data['reason']})
    }

    if(data['success']&&data['result'].length!=0){
        return res.status(400).send({"error":"username already exists"})
    }

    data = await database.query("users","email",`${email}`);

    //console.log("Result for email: ", data);

    if(!data['success']){
        return res.status(500).send({"error":data['reason']})
    }

    if(data['success']&&data['result'].length!=0){
        return res.status(400).send({"error":"email already exists"})
    }


    /* 
        Now that the validation is complete, start with cryptography
        Step 1: Generate hash for the password
        Step 2: Create Public and Private key for the user
        Step 3: Encrypt the Private Key using key = Server's cipher key and IV = salt generated for the user
    */


    const cryptography = new Cryptography();

    // Step 1: Generate hash for the password

    const hashedPassword = cryptography.generateSaltHash(password);

    // Step 2: Create Public and Private key for the user

    let { privateKey, publicKey } = cryptography.generateKeyPair();
    
    // Step 3: Encrypt the Private Key using key = Server's cipher key and IV = salt generated for the user

    const salt = hashedPassword.split(':')[0];
    
    const encryptedPrivateKey = cryptography.encipher(privateKey,Buffer.from(CIPHER_KEY),salt);

    // This is how to decrypt the Private Key for later use

    //const decryptedPrivateKey = cryptography.decipher(encryptedPrivateKey, Buffer.from(CIPHER_KEY), salt);

    /*
        Now that the data is ready, we can start entering in the details in the database
        
        Step 1: Create a payload to be inserted in the database
        Step 2: Insert the payload into the database
        Step 3: Handle any errors that may arise during insertion of the data
        Step 4: Fetch the uid that was generated automatically 
        
    */


    const userInfo = {
        username: username,
        name: name,
        hash: hashedPassword,
        public_key: publicKey,
        private_key: encryptedPrivateKey,
        email: email
    }

    const storeResult = await database.insert('users',userInfo);
    console.log(storeResult)
    if(!storeResult['success']){
        return res.status(500).send({"error":storeResult['reason']})
    }
    
    let uid = await database.query('users','username',username);
    
    uid = uid['result'][0]['uid'];

    //console.log(uid);

    /*
        Now that we have inserted the data in the database, we can prepare for the response

        Step 1: Create a Payload containing basic user information such as uid, name, username, email
        Step 2: Create a JWT Token by passing the payload
        Step 3: Send the response and set 'userToken' containing JWT Token as cookie
    */

    const jsonWebToken = new JSON_WEB_TOKEN();
    const userToken = jsonWebToken.createToken(jsonWebToken.createPayload(uid,name,username,email));

    console.log(`User with uid ${uid} created`)

    return res
    .cookie( 'userToken' , userToken ,{ httpOnly:true })
    .setHeader('Content-Type', 'application/json')
    .status(201)
    .json({
        success: "Signup completed",
        user: {
            uid: uid,
            name: name,
            username: username,
            email: email,
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
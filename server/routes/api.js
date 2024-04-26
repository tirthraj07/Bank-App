const express = require('express')
const api_router = express.Router()
const upload = require('../middleware/multer')
const JSON_WEB_TOKEN = require('../methods/jwtValidator')
const SupabaseDB = require('../methods/supabase')
const Cryptography = require('../methods/cryptoAlgo')
const { unlinkSync, readFileSync, writeFileSync } = require('node:fs');
const { randomBytes } = require('crypto')
 

api_router.get('/',(req,res)=>{
    res.status(200).send('Hello World');
})

function removeFile(filepath){
    try {
        unlinkSync(filepath);
    } catch (err) {
        console.log('Unable to delete file')
        console.log(err.message)
    }
}

async function getPublicKey(decodedToken){
    const db = new SupabaseDB()
    const uid = decodedToken.uid;
    const res = await db.query('users','uid',uid);
    if(!res.success){
        return {status:false, reason:res.reason}
    }
    const result = res.result[0]
    const public_key = result.public_key
    const salt = result.hash.split(':')[0];
    return {status:true, public_key:public_key, salt:salt}
}

function encipherFile(fileContent,salt){
    const cryptography = new Cryptography()
    const cipher_key = randomBytes(32)

    const encipheredFileContent = cryptography.encipher(fileContent,cipher_key,salt)
    return {content: encipheredFileContent, key:cipher_key}
}

async function encryptFile(file, decodedToken){
    try{
        const fetchPublicKey = await getPublicKey(decodedToken)
        if(!fetchPublicKey.status) throw new Error(fetchPublicKey.reason)
        const public_key = fetchPublicKey.public_key
        const salt = fetchPublicKey.salt
        const cryptography = new Cryptography()
        const fileContent = readFileSync(file.path);
        const {content:encipheredFileContent, key:fileKey} = encipherFile(fileContent, salt)

        const encryptedFileKey = cryptography.encryptUsingPublicKey(fileKey,public_key)
        writeFileSync(file.path,encipheredFileContent)
        return {status:true, key:encryptedFileKey}
    }
    catch(err){
        console.log(err.message);
        return {status:false, reason:err.message}
    }
}


api_router.post('/file_upload',upload.single('file'),async (req,res)=>{
    const userToken = req.cookies.userToken
    const doctype = req.headers.doctype
    const originalFileName = req.headers.filename

    if(!userToken){
        removeFile(req.file.path);
        return res.status(401).send({"error":"Unauthorized Access"});
    }

    if(!doctype||!originalFileName){
        removeFile(req.file.path);
        return res.status(400).send({"error":"Insufficient Headers"});
    }


    jwt = new JSON_WEB_TOKEN();

    const Token = jwt.validateUserToken(userToken);
    
    if(!Token.valid){
        removeFile(req.file.path);
        return res.status(401).send({"error":"Unauthorized Access"});
    }

    const decodedToken = Token.decodedToken;

    const user_id = decodedToken.uid;
    const uid = req.file.filename.split('.')[0]
    const filepath = req.file.path;
    
    

    

    try{
        const db = new SupabaseDB();

        const encryption = await encryptFile(req.file, decodedToken);
    
        if(!encryption.status) throw new Error(encryption.reason)
        const key = encryption.key

        const insertObject = {
            uid:uid,
            file_path:filepath,
            file_name:originalFileName,
            user_id:user_id,
            doctype:doctype,
            key:key
        }
    
        const dbStatus = await db.insert('file_uploads',insertObject)
        if(!dbStatus.success) throw new Error(dbStatus.reason)
        
        return res.status(200).send({"status":"success", file: req.file})
    }   
    catch(err){
        console.log(err);
        removeFile(req.file.path);
        return res.status(500).send({"error":err.message})
    }
    
})


module.exports = api_router

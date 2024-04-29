const express = require('express')
const api_router = express.Router()
const upload = require('../middleware/multer')
const JSON_WEB_TOKEN = require('../methods/jwtValidator')
const SupabaseDB = require('../methods/supabase')
const Cryptography = require('../methods/cryptoAlgo')
const { unlinkSync, readFileSync, writeFileSync } = require('node:fs');
const { randomBytes } = require('crypto')
const path = require('path')
const { createCipheriv, createDecipheriv } = require('crypto');
const forum_router = require('./forum/forum')
const CIPHER_KEY = "f8f1f5aac82f7d160906412074f3b8e5";

api_router.use('/forum',forum_router);

api_router.get('/',(req,res)=>{
    res.status(200).send('Hello World');
})



function removeFile(filepath){
    try {
        unlinkSync(filepath);
    } catch (err) {
        console.error('Unable to delete file')
        console.error(err.message)
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
    const cipher_key = randomBytes(32).toString('hex')
    const cipher = createCipheriv('aes-256-cbc', Buffer.from(cipher_key, 'hex'), salt);
    let encipheredFileContent = cipher.update(fileContent);
    encipheredFileContent = Buffer.concat([encipheredFileContent, cipher.final()]);
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
        let encryptedFileKey = cryptography.encryptUsingPublicKey(fileKey,public_key)
        writeFileSync(file.path,encipheredFileContent)
        return {status:true, key:encryptedFileKey}
    }
    catch(err){
        console.error(err.message);
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
        console.error(err);
        removeFile(req.file.path);
        return res.status(500).send({"error":err.message})
    }
    
})

function getDecryptedFileKey(encryptedFileKey,private_key){
    const cryptoAlgo = new Cryptography()
    const decryptedKey = cryptoAlgo.decryptUsingPrivateKey(encryptedFileKey, private_key)
    return decryptedKey
}

function getDecryptedFileContent(encryptedContent, fileKey, salt){
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(fileKey,'hex'), salt);
    let decrypted = decipher.update(encryptedContent);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted
}

function getDecryptedPrivateKey(encryptedPrivateKey, salt){
    const cryptoAlgo = new Cryptography()
    return cryptoAlgo.decipher(encryptedPrivateKey,Buffer.from(CIPHER_KEY),salt)
}

api_router.get('/file/:fileID',async (req,res)=>{
    const userToken = req.cookies.userToken
    const fileID = req.params.fileID

    if(!userToken) return res.status(400).send({error:"Missing User Token"})
    if(!fileID) return res.status(400).send({error:"Missing File ID"})

    const db = new SupabaseDB()
    const jwt = new JSON_WEB_TOKEN() 

    const fileCol = await db.query('file_uploads','uid',fileID)

    if(!fileCol.success) return res.status(500).send({error:fileCol.reason})

    const { user_id:file_owner_id, file_path, key:encryptedFileKey } = fileCol.result[0]

    const Token = jwt.validateUserToken(userToken)

    if(!Token.valid) return res.status(400).send({error:Token.reason})

    const decodedToken = Token.decodedToken;

    const { uid:user_id } = decodedToken;

    const queryUser = await db.query('users','uid',user_id)
    
    if(!queryUser.success) return res.status(400).send({error:queryUser.reason})

    const { private_key:encryptedPrivateKey , hash } = queryUser.result[0]
 
    const salt = hash.split(':')[0]

    if(user_id != file_owner_id) return res.status(401).send({error:"Unauthorized Access"})

    let encryptedContent = null

    try{
        
        encryptedContent = readFileSync(file_path);

        // console.log("Encrypted Content ", readFileSync(file_path))

    }catch(error){
        console.error(error.message)
        return res.status(500).send({error:error.message})
    }
    
    if(encryptedContent==null) return res.status(500).send({error:"Couldn't read file"})

    const private_key = getDecryptedPrivateKey(encryptedPrivateKey, salt);
    const fileKey = getDecryptedFileKey(encryptedFileKey,private_key);
    const decryptedFileContent = getDecryptedFileContent(encryptedContent, fileKey, salt)
    try{
        writeFileSync(file_path,decryptedFileContent)
    }
    catch(error){
        console.error(error.message)
        return res.status(500).send({error:error.message})
    }


    const absolute_path = path.resolve(__dirname,`../${file_path}`)

    res.status(200).sendFile(absolute_path, async(err)=>{
        if(err){
            console.error('Error sending file:', err)
        }
        //    Re-encrypt the data
        try{
            writeFileSync(file_path,encryptedContent)
        }
        catch(error){
            console.error("Error Occurred during re-encryption")
            console.error(error.message)
        }
    
    })



    
})

api_router.get('/getDocs',async (req,res)=>{
    const userToken = req.cookies.userToken
    if(!userToken) return res.status(400).send({error:"Missing UserToken"})
    const jwt = new JSON_WEB_TOKEN()
    const Token = jwt.validateUserToken(userToken)
    if(!Token.valid) return res.status(401).send({error:"Invalid Token"})
    const decodedToken = Token.decodedToken;
    const { uid:user_id } = decodedToken
    const database = new SupabaseDB()
    const getDocsFromDB = await database.query('file_uploads','user_id',user_id)
    if(!getDocsFromDB.success) return res.status(500).send({error:getDocsFromDB.reason})
    
    const responseData = []

    getDocsFromDB.result.forEach((file, it)=>{
        responseData.push({index:it,uid:file.uid,doctype:file.doctype,filename:file.filename,created_at:file.created_at})
    })

    return res.status(200).send(responseData);
})

module.exports = api_router

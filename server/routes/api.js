const express = require('express')
const api_router = express.Router()
const upload = require('../middleware/multer')
const JSON_WEB_TOKEN = require('../methods/jwtValidator')
const SupabaseDB = require('../methods/supabase')
const { unlinkSync } = require('node:fs');


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


api_router.post('/file_upload',upload.single('file'),(req,res)=>{
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
    
    const insertObject = {
        uid:uid,
        file_path:filepath,
        file_name:originalFileName,
        user_id:user_id,
        doctype:doctype
    }

    const db = new SupabaseDB();

    try{
        db.insert('file_uploads',insertObject)
        return res.status(200).send({"status":"success"})
    }   
    catch(err){
        console.log(err);
        return res.status(500).send({"error":err.message})
    }
    
})


module.exports = api_router

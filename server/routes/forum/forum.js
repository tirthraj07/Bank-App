const JSON_WEB_TOKEN = require('../../methods/jwtValidator')
const express = require('express')
const { spawn } = require('child_process');
const path = require('path')
const forum_router = express.Router();

function callModel(description) {
    return new Promise((resolve, reject) => {
        const modelPath = path.resolve(__dirname, "../../scripts/model.py");
        let output = '';

        const pythonProcess = spawn('python', [modelPath,description]);

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve({ success: true, output: output });
            } else {
                reject({ success: false, reason: 'Internal Server Error' });
            }
        });
    });
}

forum_router.post('/upload', async (req, res)=>{
    
    // Taking user information
    
    const userToken = req.cookies.userToken;
    if(!userToken) return res.status(400).send({error:"Missing userToken"})
    const jwt = new JSON_WEB_TOKEN()
    const Token = jwt.validateUserToken(userToken);
    if(!Token.valid) return res.status(400).send({error:Token.reason})
    const decodedToken = Token.decodedToken;
    const { uid:user_id } = decodedToken;

    // Taking complaint information

    const { title, description, type } = req.body;
    
    if(!title , !description , !type ) return res.status(400).send({error: "Missing title or description or type"});

    let priority = 0;

    try{
        const modelOutput = await callModel(description);
        if(!modelOutput.success) throw new Error(modelOutput.reason);
        priority = parseFloat(modelOutput.output.trim())
    }   
    catch(e){
        console.error(e.message)
        return res.send(500).send({error:e.message})
    }

    const payload = {
        user_id:user_id,
        title: title,
        description: description,
        type: type,
        priority: priority
    }

    return res.status(200).send(payload)


})

module.exports = forum_router;
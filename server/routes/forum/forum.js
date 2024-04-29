const JSON_WEB_TOKEN = require('../../methods/jwtValidator')
const express = require('express')
const { spawn } = require('child_process');
const path = require('path')
const forum_router = express.Router();
const SupabaseDB = require('../../methods/supabase')
const callModel = require('../../methods/pythonScript')

const urgencyModelPy = 'urgencyModel.py'
const summaryModelPy = 'summaryModel.py'


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

    // Find Priority

    let urgency = -1;

    
    const urgencyModelOutput = await callModel(urgencyModelPy,[title,description])
    if(!urgencyModelOutput.success) return res.status(500).send({error:urgencyModelOutput.reason})
    urgency = parseFloat(urgencyModelOutput.output);
    
    if(urgency === -1) return res.status(500).send({error:"Urgency model could't predict"})

    // Find Summary

    let summary = ""

    const summaryModelOutput = await callModel(summaryModelPy,[title,description])
    if(!summaryModelOutput.success) return res.send(500).send({error:summaryModelOutput.reason})
    summary = summaryModelOutput.output;

    if(summary==="") return res.status(500).send({error:"Summary Model could't summarize"})

    // Find type_id
    const database = new SupabaseDB()
    const queryTypeID = await database.query('complaints','type',type);
    if(!queryTypeID.success) return res.status(500).send({error: queryTypeID.reason})
    const { id:type_id } = queryTypeID.result[0]
    if(!type_id) return res.status(500).send({error:"Type undefined"});

    const payload = {
        type_id:type_id,
        title: title,
        description: description,
        user_id: user_id,
        resolved: false,
        urgency: urgency,
        summary:summary
    }
    

    const insertPayloadInDB = await database.insertWithResponse('user_complaints',payload);
    
    if(!insertPayloadInDB.success) return res.status(500).send({error: insertPayloadInDB.reason})

    const { complaint_id, created_at } = insertPayloadInDB.data;

    const responsePayload = {complaint_id:complaint_id, created_at:created_at, ...payload}    

    return res.status(201).send({success:"Post Added Successfully", post:responsePayload})

})

module.exports = forum_router;
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io")
const io = new Server(server)

const HOSTNAME = '127.0.0.1';
const PORT = 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

io.on("connection",(socket)=>{
    console.log("Client Connected to the Server");
})

app.get('/',(req,res)=>{
    res.send({"Message":"Hello World"})
})

server.listen(PORT,HOSTNAME,()=>{
    console.log(`Server listening at http://${HOSTNAME}:${PORT}`)
});
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io')
const io = new Server(server)

const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

io.on("connection",(socket)=>{
    console.log("Client Connected to the Server");
})

app.get('/',(req,res)=>{
    res.send({"Message":"Hello World"})
})

server.listen(PORT,()=>{
    console.log(`Server listening at http://${HOSTNAME}:${PORT}`)
});
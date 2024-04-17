const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const cors = require('cors');
const io = require('socket.io')(server,{
    cors:{
        origin: "https://example.com",
        methods: ["GET", "POST","PUT","PATCH","DELETE"],
    }
})
app.use(cors());

const HOSTNAME = '127.0.0.1';
const PORT = 3005;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

io.on("connection",(socket)=>{
    console.log("Client Connected to the Server");
})

app.get('/api',(req,res)=>{
    res.send({"Message":"Hello World"})
})

server.listen(PORT,()=>{
    console.log(`Server listening at http://${HOSTNAME}:${PORT}`)
});
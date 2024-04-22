const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const cookieParser = require('cookie-parser')
const cors = require('cors');
const io = require('socket.io')(server,{
    cors:{
        origin: "*",
        methods: ["GET", "POST","PUT","PATCH","DELETE"],
    }
})
const auth_router = require('./routes/auth') 
app.use(cors());

    const HOSTNAME = '127.0.0.1';
    const PORT = 3005;
    const SECRET_KEY = 'vgvsvTGusrlx2jdZi7oVVDQBtTjlOO6j';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser())

const authenticationMiddleware = require('./middleware/auth');

app.use('/auth/',auth_router);

io.on("connection",(socket)=>{
    console.log("Client Connected to the Server");
})

app.get('/api',(req,res)=>{
    res.send({"Message":"Hello World"})
})

server.listen(PORT,()=>{
    console.log(`Server listening at http://${HOSTNAME}:${PORT}`)
});


module.exports = app
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const cookieParser = require('cookie-parser')
const cors = require('cors');
const path = require('path')
const initializeSocket = require('./websockets/socketHandler')

const auth_router = require('./routes/auth') 
const api_router = require('./routes/api')
app.use(cors());

const HOSTNAME = '127.0.0.1';
const PORT = 3005;
const SECRET_KEY = 'vgvsvTGusrlx2jdZi7oVVDQBtTjlOO6j';



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser())

const authenticationMiddleware = require('./middleware/auth');

app.use('/auth/',auth_router);

app.use('/api',[authenticationMiddleware],api_router);

initializeSocket(server);initializeSocket

// app.get('/api',(req,res)=>{
//     res.send({"Message":"Hello World"})
// })

server.listen(PORT,()=>{
    console.log(`Server listening at http://${HOSTNAME}:${PORT}`)
});


module.exports = app
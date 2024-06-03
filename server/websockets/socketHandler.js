const socketIo = require('socket.io')
const JSON_WEB_TOKEN = require('../methods/jwtValidator')
const handleSendMessage = require('./methods/handleSendMessage')

const jwt = new JSON_WEB_TOKEN()

function initializeSocket(server){
    const io = socketIo(server,{
        cors:{
            origin: "*",
            methods: ["GET", "POST","PUT","PATCH","DELETE"],
        }
    });

    io.on("connection", (socket)=>{
        console.log(`Socket ${socket} trying to establish connection with the server`)
        
        // Verify the handshake query token
        
        const token = socket.handshake.query.token;

        if(!token){
            console.log("Socket connection failed due to no handshake query token")
            socket.disconnect(true);
            return;
        }

        const Token = jwt.validateUserToken(token)
        if(!Token.valid){
            console.log("Socket connection failed due to invalid Token")
            console.log("Error: ",Token.reason)
            socket.disconnect(true);
            return;
        }

        const { uid:userId, name, username, iv } = Token.decodedToken
        
        console.log(`User ID ${userId} connected to the server`)

        socket.on("joinRoom", (chatRoom) => {
            if(!Buffer.isBuffer(chatRoom)){
                console.log("Payload 'chatRoom' sent through the socket connection was not a buffer")
                socket.disconnect(true);
                return;
            }
            socket.join(chatRoom);
            console.log(`Client joined room ${chatRoom}`);
        });


        socket.on("leaveRoom", (chatRoom) => {
            if(!Buffer.isBuffer(chatRoom)){
                console.log("Payload 'chatRoom' sent through the socket connection was not a buffer")
                socket.disconnect(true);
                return;
            }
            socket.leave(chatRoom);
            console.log(`Client left room ${chatRoom}`);
        });

        /*
        Note: Insufficient validation when decoding a Socket.IO packet
        Due to improper type validation in the socket.io-parser library (which is used by the socket.io and socket.io-client packages to encode and decode Socket.IO packets), it is possible to overwrite the _placeholder object which allows an attacker to place references to functions at arbitrary places in the resulting query object.
        
        FIX:
        You need to make sure that the payload that you received from the client is actually a Buffer object
        
        */
        

        socket.on('sendMessage', ({ message, chatRoom }) => {
            if(!Buffer.isBuffer(message) || !Buffer.isBuffer(chatRoom)){
                console.log("Payload sent through the socket connection was not a buffer")
                socket.disconnect(true);
                return;
            }
            
            const payload = {message:message, chatRoom:chatRoom, userId:userId, name:name, username:username, iv:iv}

            handleSendMessage(io, payload)

        })
        
        socket.on("disconnect", () => {
            console.log("Client disconnected from the server");
        });



    })
}

module.exports = initializeSocket;

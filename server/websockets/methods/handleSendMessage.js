const Chats = require('../../methods/chats');

async function handleSendMessage(io, { message, chatRoom, userId, name, username, iv }){
    io.to(chatRoom).emit("message", {message, name, username, chatRoom})

    const chat = new Chats();
    const storeMessageResult = await chat.storeMessages(message, userId, chatRoom, iv)
    if(!storeMessageResult.success){
        console.log("Error : ", storeMessageResult.error);
        return;
    }
    console.log("Message Sent Successfully", storeMessageResult.result);
}

module.exports = handleSendMessage;
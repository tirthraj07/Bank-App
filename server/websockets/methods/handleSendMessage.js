function handleSendMessage(io, { message, chatRoom, userId, name, username, iv }){
    io.to(chatRoom).emit("message", {message, name, username, chatRoom})

    // TODO: Use the chat class to insert the message into the database

}

module.exports = handleSendMessage;
const SupabaseDB = require('../../methods/supabase')
const Cryptography = require('../../methods/cryptoAlgo')

const db = new SupabaseDB()
const crypto = new Cryptography()

const CIPHER_KEY = "f8f1f5aac82f7d160906412074f3b8e5";


function encryptMessage(message, iv){
    return crypto.encipher(message, Buffer.from(CIPHER_KEY), iv)
}


function handleSendMessage(io, { message, chatRoom, userId, name, username, iv }){
    io.to(chatRoom).emit("message", {message, name, username, chatRoom})

    const encryptedMessage = encryptMessage(message, iv);

    const jsonPayload = {
        chatRoom: chatRoom,
        sender_id: userId,
        message: encryptedMessage
    }

    db.insert('chats', jsonPayload)

}

module.exports = handleSendMessage;
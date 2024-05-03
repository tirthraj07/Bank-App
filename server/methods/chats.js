const SupabaseDB = require('./supabase')
const Cryptography = require('./cryptoAlgo')

const db = new SupabaseDB()
const crypto = new Cryptography()

const CIPHER_KEY = "f8f1f5aac82f7d160906412074f3b8e5";


function encryptMessage(message, iv){
    return crypto.encipher(message, Buffer.from(CIPHER_KEY), iv)
}

async function getSalt(user_id){
    const queryResult = await db.query('users','uid',user_id);
    if(!queryResult.success) return {success:false, error:queryResult.reason}
    const hash = queryResult.result[0].hash
    const salt = hash.split(':')[0]
    return {success: true, salt: salt}
}

class Chats {

    async validateChatroom(chat_id){
        if(!chat_id){
            return {valid: false};
        }

        const queryChatroomResult = await db.query('chat_rooms','chat_id',chat_id);

        return {valid: queryChatroomResult.success}
    }

    async validateUserAssociationWithChatroom(user_id, chat_id){
        if(!user_id || !chat_id){
            return {valid: false, reason: "Missing user_id or chat_id"}
        }

        const queryUserChatRoomTable = await db.query('user_chatrooms','user_id',user_id)

        if(!queryUserChatRoomTable.success){
            return {valid: false, reason: queryUserChatRoomTable.reason}
        }

        const results = queryUserChatRoomTable.result;

        results.forEach(({chat_id:user_chat_id})=>{
            if(user_chat_id===chat_id){
                return {valid: true}
            }
        })

        return {valid:false, reason: "Could not find chat_id associated with user_id"}

    }

    async storeMessages(message, chat_id, sender_id, iv){
        const authorize = await validateUserAssociationWithChatroom(sender_id, chat_id)
        if(!authorize.valid){
            return {success: false, reason: authorize.reason}
        }

        const encryptedMessage = encryptMessage(message, iv);

        const jsonPayload = {
            chat_id: chat_id,
            sender_id: sender_id,
            message: encryptedMessage
        }
        const insertMessageInDB = await db.insert('chat_messages',jsonPayload)
        if(!insertMessageInDB.success){
            return {success: false, error: insertMessageInDB.reason}
        }

        return {success: true, result: jsonPayload}

    }

    async chatHistory(chat_id){
        const validateChatroomQuery = await validateChatroom(chat_id)
        if(!validateChatroomQuery.valid){
            return {success: false, reason: "Error occurred while validating the chat_id"}
        }

        try{
            // TODO: Retrieve the messages and sender id and then decrypt the messages
        }
        catch(e){
            console.log(e.message)
        }


    }
    


}

module.exports = Chats
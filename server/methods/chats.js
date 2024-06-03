const SupabaseDB = require('./supabase')
const Cryptography = require('./cryptoAlgo')

const db = new SupabaseDB()
const crypto = new Cryptography()

const CIPHER_KEY = "f8f1f5aac82f7d160906412074f3b8e5";


function encryptMessage(message, iv){
    return crypto.encipher(message, Buffer.from(CIPHER_KEY), iv)
}

function decryptMessage(message, iv){
    return crypto.decipher(message, Buffer.from(CIPHER_KEY), iv)
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
            return {valid: false, reason: "Missing chat_id" };
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
        const isAssociated = queryUserChatRoomTable.result.some(({ chat_id: user_chat_id }) => user_chat_id === chat_id);
        if (isAssociated) {
            return { valid: true };
        }

        return { valid: false, reason: "User not associated with chat_id" };
    }

    async storeMessages(message, chat_id, sender_id, iv){
        const authorize = await this.validateUserAssociationWithChatroom(sender_id, chat_id)
        if(!authorize.valid){
            return {success: false, error: authorize.reason}
        }

        const encryptedMessage = encryptMessage(message, iv);

        const jsonPayload = {
            chat_id: chat_id,
            sender_id: sender_id,
            message: encryptedMessage,
            iv: iv
        }
        const insertMessageInDB = await db.insert('chat_messages',jsonPayload)
        if(!insertMessageInDB.success){
            return {success: false, error: insertMessageInDB.reason}
        }

        return {success: true, result: jsonPayload}

    }

    async chatHistory(chat_id){
        const validateChatroomQuery = await this.validateChatroom(chat_id)
        if(!validateChatroomQuery.valid){
            return {success: false, reason: "Error occurred while validating the chat_id"}
        }

        try{

            // TODO: Retrieve the messages and sender id and then decrypt the messages
            const chatHistoryResponse = await db.query('chat_messages', 'chat_id', chat_id)
            if(!chatHistoryResponse.success){
                return {success: false, reason: chatHistoryResponse.reason};
            }

            const chatHistoryMap = chatHistoryResponse.result.map((data)=>{
                const decryptedMessage = decryptMessage(data.message, data.iv);
                return {message: decryptedMessage, ...data};
            }) 

            return {success: true, result: chatHistoryMap};
        }
        catch(e){
            console.log(e.message)
        }


    }

    async createRoom(name){
        if(name==""|typeof(name)!= 'string'){
            return {success: false, reason: "Empty Name | Type of name not string"};
        }
        const createNewChatRoom = await db.insertWithResponse('chat_rooms',{name:name});
        if(!createNewChatRoom.success){
            return {success: false, reason: createNewChatRoom.reason};
        }
        return {success: true, data: createNewChatRoom.data};
    }
    


}

module.exports = Chats
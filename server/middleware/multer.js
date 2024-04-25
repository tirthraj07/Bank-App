const multer  = require('multer')
const JSON_WEB_TOKEN = require('../methods/jwtValidator')
const fs = require('fs');
const { v4:uuidv4 } = require('uuid')
 
function getFoldername(req){
    let folderName = 'temp'
    if(req.cookies.userToken){
        jwtUserToken = new JSON_WEB_TOKEN()
        const decodedToken = jwtUserToken.validateUserToken(req.cookies.userToken)
        if(decodedToken.valid){
            folderName = decodedToken.decodedToken.username;
        }
    }
    return folderName;
}


function getExtension(file){
    let extension = 'file'
    if (file.originalname.split('.').length>=2){
        extension = file.originalname.split('.')[file.originalname.split('.').length-1];
    }
    return extension
}

// function getFname(req){
//     let fname = 'temp';
//     if(req.cookies.userToken){
//         jwtUserToken = new JSON_WEB_TOKEN()
//         const decodedToken = jwtUserToken.validateUserToken(req.cookies.userToken)
//         if(decodedToken.valid){
//             fname = `${decodedToken.decodedToken.username}`;
//         }
//     }
//     if(req.headers.doctype){
//         fname += `_${req.headers.doctype}`
//     }
//     return fname
// }

const storage = multer.diskStorage({
    
    destination: function (req, file, cb) {
        const folderName = getFoldername(req);
        const folderPath = `./public/${folderName}`;
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        cb(null, `./public/${folderName}`)
    },
    filename: function (req, file, cb) {
        const extension = getExtension(file);
        // const fname = getFname(req);
        const fname = uuidv4();
        finalFileName = `${fname}.${extension}`;
        cb(null, finalFileName)
    }   
})

const upload = multer({ storage: storage })


module.exports = upload;
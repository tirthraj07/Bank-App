const { spawn } = require('child_process');
const path = require('path')

const scriptsFolderPath = path.resolve(__dirname,'../scripts')

function callModel(filename, params){
    return new Promise((resolve, reject)=>{
        const filepath = path.join(scriptsFolderPath, filename)
        let argv = [filepath]
        if(params){
            params.forEach((param)=>{
                argv.push(param)
            })
        }
        try{
            let output = '';
            const pythonProcess = spawn('python',argv)
            pythonProcess.stdout.on('data', (data)=>{
                output += data.toString()
            })
            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, output: output.trim() });
                } else {
                    reject({ success: false, reason: 'Internal Server Error' });
                }
            });
        }
        catch(error){
            reject({success:false, reason:error.message})
        }

    })
}


module.exports = callModel
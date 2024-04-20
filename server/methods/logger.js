const winston = require('winston')
const {combine,timestamp,json,prettyPrint,errors} = winston.format
const path = require('path');
const { error } = require('console');

const logDirectory = path.resolve(__dirname,'../logs');

winston.loggers.add('SignupLogger',{
    level:'info',
    format: combine(
        errors({stack:true}),
        timestamp(),
        json(),
        prettyPrint()
    ),
    transports:[
        new winston.transports.Console(),
        new winston.transports.File({
            filename: path.join(logDirectory,'signup.log'),
            tailable: true,
            maxsize: 5242880,
        })
    ],
    defaultMeta: {service: 'SignupService'}

})

winston.loggers.add('SignupErrorLogger',{
    level:'error',
    format: combine(
        errors({stack:true}),
        timestamp(),
        json(),
        prettyPrint()
    ),
    transports:[
        new winston.transports.Console(),
        new winston.transports.File({
            filename: path.join(logDirectory,'signup_error.log'),
            tailable: true,
            maxsize: 5242880,
        })
    ],
    defaultMeta: {service: 'SignupService'}

})


winston.loggers.add('LoginLogger',{
    level:'info',
    format: combine(
        errors({stack:true}),
        timestamp(),
        json(),
        prettyPrint()
    ),
    transports:[
        new winston.transports.Console(),
        new winston.transports.File({
            filename: path.join(logDirectory,'login.log'),
            tailable: true,
            maxsize: 5242880,
        })
    ],
    defaultMeta: {service: 'LoginService'}

})

winston.loggers.add('LoginErrorLogger',{
    level:'error',
    format: combine(
        errors({stack:true}),
        timestamp(),
        json(),
        prettyPrint()
    ),
    transports:[
        new winston.transports.Console(),
        new winston.transports.File({
            filename: path.join(logDirectory,'login_error.log'),
            tailable: true,
            maxsize: 5242880,
        })
    ],
    defaultMeta: {service: 'LoginService'}

})

class Logger{
    constructor(){
        this.signup_logger = winston.loggers.get('SignupLogger')
        this.signup_error_logger = winston.loggers.get('SignupErrorLogger')
        this.login_logger = winston.loggers.get('LoginLogger')
        this.login_error_logger = winston.loggers.get('LoginErrorLogger')
    }

    logSignup(userInfo){
        // userInfo is a javascript object that contains uid, name, email and username of the user
        this.signup_logger.info('User Signup',userInfo);
    }

    logLogin(userInfo){
        this.login_logger.info('User Login',userInfo);
    }

    logSignupError(errorInfo){
        // errorInfo is a javascript object that contains an error and its reason
        this.signup_error_logger.error('Failed Signup',errorInfo)
    }

    logLoginError(errorInfo){
        this.login_error_logger.error('Failed Login', errorInfo)
    }
}

module.exports = Logger


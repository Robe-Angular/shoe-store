var bcrypt = require('bcryptjs');
var dotenv = require('dotenv').config();
const moment = require('moment');
const nodemailer = require('nodemailer');
const hiddenUser = process.env.EMAIL_DOMAIN;
const hiddenPassword = process.env.EMAIL_API_KEY;
var jwt = require('../services/jwt');

var User = require('../models/user');
var ConfirmationUpdateEmail = require('../models/confirmationUpdateEmail');
var RecoverPassword = require('../models/recoverPassword');
var ConfirmationCode = require('../models/confirmationCode');

const {messageError,regexLowerCase} = require('../services/constService');

const {newTransport, sendConfirmationEmail, sendConfirmationEmailOnUpdating, sendResetEmail} = require('../services/emailService');
const confirmationUpdateEmail = require('../models/confirmationUpdateEmail');
const { now } = require('moment');

const g_f_createCode = () => {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let confirmationCode = '';
    for (let i = 0; i < 25; i++) {
        confirmationCode += characters[Math.floor(Math.random() * characters.length )];
    }
    return confirmationCode;
}
const transport = newTransport(hiddenUser, hiddenPassword);
//not used but maybe useful in the future
/*
const replaceSlashesDotsAndDollars = (stringToReplace) => {
    return stringToReplace.split('.').join('ASimpleDot').split('/').join('ASimpleSlash').split('$').join('ASimpleDollar')
}

const reverseReplaceSlashesDotsAndDollars = (stringToReplace) => {
    return stringToReplace.split('AsimpleDot').join('.').split('AsimpleSlash').join('/').split('ASimpleDollar').join('$')
}
*/

function saveUser(req,res){   
    
    const roundHash = 8;
    const roundHashVerification = 10;
    var params = req.body;
    var user = new User();
    /*
    let transport = nodemailer.createTransport({
        service: 'Hotmail',
                auth:{
                    user: hiddenUser,
                    pass: hiddenPassword
                }
    });
    */
    //all spaces filled
    if(params.name && params.lastName && params.nick && params.email && params.password){
        user.name = params.name;
        user.lastName = params.lastName;
   
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        
    }else{
        return messageError(res,300,'Send all fields');
    }
    //user duplicated control
    let userEmail = user.email;
    let userNick = user.nick;
    let regexQueryEmail= regexLowerCase(userEmail);
    let regexQueryNick= regexLowerCase(userNick);

    User.findOne({$or: [
                    {email:regexQueryEmail},
                    {nick:regexQueryNick}
                ]})
    .exec((err,userExist) => {
        if(err){
            return messageError(res,500,'Server Error');
        }

        if(userExist){        
            return messageError(res,300, 'User already exists')
        }else{
            //encode password and save
            bcrypt.hash(params.password, roundHash, (err, hash) => {
                if(err){
                    return messageError(res,500, 'Request error');
                }
                user.password = hash;
                
                //Confirmación de email               
                let plainConfirmationCode = g_f_createCode();

                bcrypt.hash(plainConfirmationCode,roundHashVerification,(err,encryptedCode) => {
                    if(err) return messageError(res, 500, 'Error at hashing encryptedCode')
                    let confirmationCode = new ConfirmationCode();
                    confirmationCode.confirmationCode = encryptedCode;
                    user.save((err, userStored) => {
                        if(err) return messageError(res, 500, 'Error at saving user')
                        if(userStored){    
                            confirmationCode.user = userStored._id;
                            userStored.password = undefined;
                            confirmationCode.save((err,confirmationCodeSaved) => {
                                if(err) return messageError(res, 500, 'Error at saving confirmationCode');
                                sendConfirmationEmail(transport,hiddenUser,userStored.name, userStored.email, plainConfirmationCode,(err,info) => {
                                    if(err){
                                        console.log(err);
                                        return res.status(500).send({
                                            userStored,
                                            messsage:'Error sending email'
                                        })
                                        
                                    }else{
                                        return res.status(200).send({
                                            userStored
                                        });
                                    }
                                });           
                            });
                        }
                    });                
                });
            });          
        }
    });

}
async function tryConfirmationEmail(req, res){
    try{
        const roundHash = 8;
        const roundHashVerification = 10;
        var params = req.body;
        var user = new User();
        
        let plainConfirmationCode = g_f_createCode();
        bcrypt.hash(plainConfirmationCode,roundHashVerification,async (err,encryptedCode) => {
            try{
                if (err) return messageError(res,300,'encrypting failed');
                let userMatch = await User.findOne({email:params.email},'-password',{new:true});
                if(!userMatch) return messageError(res,300,'No user found');
                let userId = userMatch._id;
                let confirmationCodeMatch = await ConfirmationCode.findOne({user:userId});

                const sendEmail = (confirmationCodeObject) => {
                    sendConfirmationEmail(transport,hiddenUser,userMatch.name, userMatch.email, plainConfirmationCode, (err,info) => {
                        if(err){
                            console.log(err);                                        
                            return messageError(res,500,'Error sending email');
                        }else{
                            return res.status(200).send({
                                userMatch
                            });   
                        }
                    });
                }
                const createNewConfirmationCode = () => {
                    let newConfirmationCode = new ConfirmationCode();
                    newConfirmationCode.user = userMatch._id;
                    newConfirmationCode.confirmationCode = encryptedCode;
                    newConfirmationCode.save();
                    sendEmail(newConfirmationCode);
                }
                

                if(!confirmationCodeMatch){
                    createNewConfirmationCode();
                }else{
                    checkTime(res,2,confirmationCodeMatch,async () => {
                        userMatch.password = undefined;
                        await ConfirmationCode.deleteOne({user:userMatch});
                        createNewConfirmationCode();
                    });
                }
                        
            }catch(err){
                console.log(err);
                return messageError(res,500,'Server Error')
            }
        });

        
    }catch(err){
        console.log(err);
        return messageError(res,500,'Server Error');
    }
}//Send confirmationEmail again

const checkTime = (res,minutes,objectWithDate, callback) => {
    let dateNow = new Date();
    let dateOfObject = objectWithDate.createdAt;
    let dateTwoMinutesAfter = new Date(dateOfObject);
    dateTwoMinutesAfter.setMinutes(dateOfObject.getMinutes() + minutes);
    console.log(dateNow);
    console.log(dateOfObject);
    if(dateNow < dateTwoMinutesAfter){
        let secondsToUnlock = Math.round((dateTwoMinutesAfter - dateNow)/1000);
        return (messageError(res,300,"Send again after " + secondsToUnlock + " seconds"));
    }else{
        callback();
    }
}

function verifyUser(req, res){
    let emailParams = req.body.email;
    let codeVerificationParams = req.body.confirmationCode;
    let regexQueryEmail = regexLowerCase(emailParams);
    User.findOne({email:regexQueryEmail}, (err,user) => {
        if(err) return messageError(res, 500, 'Request error');
        if(user){
            let userId = user._id;
            ConfirmationCode.findOne({user:userId},(err,confirmationCodeMatch) => {
                
                bcrypt.compare(codeVerificationParams, confirmationCodeMatch.confirmationCode, (err, match) => {
            
                    if(err) return messageError(res,500,'Server Error');
                    
                    user.emailConfirmed = match;
                    if(user.emailConfirmed){
                        user.save(err => {
                            ConfirmationCode.findOneAndDelete({user:userId});
                            if(err){
                                console.log(err);
                                return messageError(res, 500, 'Request error');
                            }else{
                                if(user.password){
                                    user.password = undefined;
                                }                            
                                return res.status(200).send({
                                    user
                                });
                                
                            }
                        });
                    }else{
                        return messageError(res,300,'No match Code');
                    }
                });  
            });
            
        }else{
            return messageError(res, 404, 'User Not Found');
        }        
    });
}

function loginUser(req, res){
    const roundHash = 8;
    
    let params = req.body;
    let email = params.email;
    let password = params.password;
    let regexQueryEmail = regexLowerCase(email);
    User.findOne({email:regexQueryEmail},(err, user) => {
        if(err){
            return messageError(res,500,'Request error');
        }else{
            if(user){
                bcrypt.compare(password, user.password, (err, check) => {
                    if(check && user.emailConfirmed){
                        if(params.gettoken){
                            return res.status(200).send({
                               token: jwt.createToken(user)
                            });
                        }else{
                            user.password = undefined;
                            return res.status(200).send({user});
                        }
                    }else{
                        if(!user.emailConfirmed){
                            if(!check){
                                return messageError(res, 300, 'incorrect password');
                            }else{
                                return messageError(res, 300, 'Email not confirmed');
                            }
                            
                        }else{
                            return messageError(res, 300, 'incorrect password');
                        }
                        
                    }
                });
                
            }else{
                return messageError(res, 300,'User not found');
            }
        }
    });
}

function recoverPasswordEmail(req,res){
    const roundHashPasswordCode = 10; //must be same on PasswordResetGet
    let userEmail = req.body.email;
    let recoverPassword = new RecoverPassword();
    
    //save recover password on DB and send email
    const setRecoverPassword = (res,recoverPassword, recoverUser) => {
        recoverPassword.user = recoverUser._id;
        let resetCode = g_f_createCode();
        
        
        bcrypt.hash(resetCode,roundHashPasswordCode,(err,hash) => {
            if(err) return messageError(res,500,'Request error');
            if(hash){
                recoverPassword.recoverCode = hash;
                recoverPassword.save((err,recoverPasswordStored) => {
                    if(err) return messageError(res,500,'Request error');
                    
                    if(recoverPasswordStored) {
                        sendResetEmail(transport,hiddenUser,recoverUser.name,recoverUser.email,resetCode,(err,info) => {
                            if (err){
                                return messageError(res,500,'Error sending Email');
                            }else{
                                return res.status(200).send({recoverPasswordStored});
                            }
                        });
                    }
                });
            }            
        });        
    };

    const newRecover = () => User.findOne({'email':userEmail}).exec((err,user) => {
        if(err) return messageError (res,500,'Request error');
        if(user) {                    
            setRecoverPassword(res,recoverPassword,user);
        }else{
            return messageError(res,300,'If you have any account the email was sended')
        }
    });
    User.findOne({'email':regexLowerCase(userEmail)},(err,recoverUser)=>{
        if(err) return messageError(res,500,'Request error');                
        if(!recoverUser) return messageError(res,400,'No user found');
        RecoverPassword.findOne({"user":recoverUser._id},(err,recoverPasswordQuery) => {
            if(err) return messageError(res,500, 'Request error');                
            let recoverId = recoverPassword._id
            if(recoverPasswordQuery){
                if(err) return messageError(res,500,'Request error'); 
                
                /*let dateNow = new Date();
                let recoverDate = recoverPasswordQuery.createdAt;
                let dateTwoMinutesAfter = new Date(recoverDate);
                dateTwoMinutesAfter.setMinutes(recoverDate.getMinutes() + 2);
                if(dateNow < dateTwoMinutesAfter){
                    let secondsToUnlock = Math.round((dateTwoMinutesAfter - dateNow)/1000);
                    return (messageError(res,300,"Send again after " + secondsToUnlock + " seconds"));
                }else{
                    RecoverPassword.find({'_id':recoverId}).deleteOne((err,removed) => {
                        
                            setRecoverPassword(res,recoverPasswordQuery,recoverUser);                        
                        
                    });
                }*/
                checkTime(res,2,recoverPasswordQuery,() => {
                    RecoverPassword.find({'_id':recoverId}).deleteOne((err,removed) => {
                        setRecoverPassword(res,recoverPasswordQuery,recoverUser);                         
                    });
                })
            }else{
                newRecover();
            }
        
        });
    });
    
}

function recoverPasswordSubmit(req,res){
    const roundHash = 8;
    let params = req.body;
    let regexQueryEmail = regexLowerCase(params.email);
    let recoveryPaswordCode = params.recoveryPasswordCode;
    let newPassword = params.newPassword;
    let userToUpdate = new User();
    
    User.findOne({'email':regexQueryEmail}, (error, user)=>{
        if(error) return messageError(res,500,'Server error');
        if(user){
            
            RecoverPassword.findOne({'user': user._id},(err, recoverPassword) => {
                if(err) return messageError(res,500,'Server error');
                
                if(recoverPassword){
                    let recoverPasswordId = recoverPassword._id;
                    bcrypt.compare(recoveryPaswordCode, recoverPassword.recoverCode, (err, check) => {
                        if(err) return messageError(res,500,'Server error');

                        if(recoverPassword.user = user._id && check){
                            userToUpdate = user;
                            bcrypt.hash(newPassword, roundHash, (err, hash) => {
                                userToUpdate.password = hash;
                                User.findByIdAndUpdate(user._id, userToUpdate,{new: true}, (err, userUpdated) => {
                                    RecoverPassword.find({'_id':recoverPasswordId}).deleteOne((err,recoverPasswordDeleted) => {
                                        if(err) return messageError(res,500,'Server error');
                                        userUpdated.password = undefined;                                        
                                        if(recoverPasswordDeleted) return res.status(200).send({userUpdated});
                                    });
                                });
                            });
                        }else{
                            return messageError(res,300,'user not match with code');
                        }                    
                    });
                }else{
                    return messageError(res,300,'Code not exists');
                }
            });
        }else{
            return messageError(res,300,'No user found');
        }
    });

}

function getUser(req,res){
    
    var userId = req.params.userId;
    const findUser = () => {
        User.findById(userId, '-password', (err, user) => {
            if(err) return messageError(res,500, 'Request error');
    
            if(!user) return messageError(res,300, 'User doesn\'t exists');

            return res.status(200).send({user});
        });
    };
    findUser();
}

function getUsers(req,res){
    var itemsPerPage = 5;
    var page = 1;
    
    if(req.params.page){
        page = req.params.page;
    }
    sort = '_id';
    if(req.params.sort){
        sort = req.params.sort            
    }

    if(sort == 'password' || sort == '-password'){
        return messageError(res,300,'Don\'t have credentials')
    }else{
        User.find(null,'-password').collation({locale: "en" }).sort(sort).paginate(page, itemsPerPage, (err, users, total) => {
            if(err) return messageError(res, 500,'Error en la petición');
            
            if(!users) {
                
                return messageError(res, 300, 'No users');
            }else{
                if(users.length == 0){                    
                    return messageError(res,300,'No many users');
                }else{
                    return res.status(200).send({
                        page,
                        users,
                        total,
                        pages: Math.ceil(total / itemsPerPage)
                    });
                }
            }                                    
        });
    }
}

function updateUser(req,res){
    const roundHash = 10;
    let bodyParams = req.body;
    let userRequestId = req.params.userId;
    let userSessionId = req.user.sub;   
    
    let regexQueryEmail= regexLowerCase(bodyParams.email);
    let regexQueryNick= regexLowerCase(bodyParams.nick);
    delete bodyParams.password;
    let user = new User();

    const saveNewConfirmationUpdateEmail = (confirmationUpdateEmail) =>{
        confirmationUpdateEmail.save((err, confirmationUpdateEmailStored) => {
            if(err) return messageError(res,500,'Server error');
            if(confirmationUpdateEmailStored){
                return res.status(200).send({
                    confirmationUpdateEmailStored
                });
            }
        });
    }

    if(userSessionId != userRequestId) {
        return messageError(res,300, 'No puedes actualizar el usuario');
    }
    if(bodyParams.email && bodyParams.nick){
        user.email = bodyParams.email;
        user.nick = bodyParams.nick;
        user.telephone = bodyParams.telephone;
        user.name = bodyParams.name;
        user.lastName = bodyParams.lastName;
        User.find({ $or:[
            {email: regexQueryEmail},
            {nick: regexQueryNick}
        ]}).exec((err,users) => {
            if(err) return messageError(res,500,'Server error');
            if(users.length == 1 && users[0]._id != req.user.sub || users.length > 1){   
                return messageError(res,409,'Nickname or email already used');
            }else{
                let lowerReqUserEmail = req.user.email.toLowerCase();
                let lowerUserEmail = user.email.toLowerCase();
                if(lowerUserEmail == lowerReqUserEmail){

                    User.findByIdAndUpdate(userSessionId,{$set:bodyParams},{new:true}, (err, userUpdated) => {
                        if (err) return messageError(res,500,'Server Error');
                        userUpdated.password = undefined;
                        if(userUpdated){
                            return res.status(200).send({
                                token: jwt.createToken(userUpdated),
                                userUpdated
                            });
                        }else{
                            if (err) return messageError(res,300,'No credentials');
                        }
                    });
                }else{
                    let confirmationUpdateCode = g_f_createCode();
                    let confirmationUpdateEmail = new ConfirmationUpdateEmail();
                    sendConfirmationEmailOnUpdating(transport,hiddenUser,req.user.name,user.email,confirmationUpdateCode,(err,info) => {
                        console.log(err);
                        if(err) return messageError(res,500,'Server Error');
                        confirmationUpdateEmail.user = userSessionId;
                        confirmationUpdateEmail.email = user.email;
                        confirmationUpdateEmail.nick = user.nick;
                        bcrypt.hash(confirmationUpdateCode, roundHash, (err, hash) => {
                            if(err) return messageError(res,500,'Server error');
                            if(hash){
                                confirmationUpdateEmail.confirmationCode = hash;
                                ConfirmationUpdateEmail.findOne({user:userSessionId},(err, confirmationUpdateEmailExists) => {
                                    if(confirmationUpdateEmailExists){
                                        ConfirmationUpdateEmail.deleteOne({_id:confirmationUpdateEmailExists._id}, (err) => {
                                            if(err) return messageError(res,500,'Server Error');
                                            saveNewConfirmationUpdateEmail(confirmationUpdateEmail);
                                        });
                                    }else{
                                        saveNewConfirmationUpdateEmail(confirmationUpdateEmail);
                                    }                                
                                });                            
                            }
                        });                                          
                    });                    
                }                
            }
        });
    }else{
        return messageError(res,300,'Field empty');
    }
}

function updatingBecauseDiferentEmail(req,res){
    let userSessionId = req.user.sub;
    let confirmationCode = req.body.confirmationCode;
    let passwordBody = req.body.password;

    const deleteConfirmation = (confirmationUpdateId,functionCallback) => {
        ConfirmationUpdateEmail.deleteOne({_id:confirmationUpdateId}).exec(functionCallback);
    };
    ConfirmationUpdateEmail.findOne({user:userSessionId},(err,confirmationUpdateEmail) => {
        if(err) return messageError(res,500,'Server error');
        if(confirmationUpdateEmail){
            bcrypt.compare(confirmationCode,confirmationUpdateEmail.confirmationCode,(err,matchCode) => {
                if(err) return messageError(res,500,'Server error');
                if(matchCode){
                    User.findById(userSessionId, (err,user) => {
                        if(err) return messageError(res,500,'Server error');
                        bcrypt.compare(passwordBody, user.password,(err,match) => {
                            
                            if(err) return messageError(res,500,'Server error');
                            if(!match) return messageError(res,300,'No user match');
                            
                            let regexQueryEmail = regexLowerCase(confirmationUpdateEmail.email);
                            let regexQueryNick = regexLowerCase(confirmationUpdateEmail.nick);
                            User.find(
                                {$or:[
                                    {email:regexQueryEmail},
                                    {nick:regexQueryNick}
                            ]}).exec((err,users) => {
                                if(err) return messageError(res,500,'Server Error');
                                let userExists = false;
                                users.forEach(element => {
                                    userExists = element._id != userSessionId;
                                });
                                if(!userExists){
                                    deleteConfirmation(confirmationUpdateEmail._id,(err) => {
                                        if(err) return messageError(res,500,'Server Error');
                                        if(user && match){
                                            user.nick = confirmationUpdateEmail.nick;
                                            user.email = confirmationUpdateEmail.email;
                                            User.findByIdAndUpdate(userSessionId,user,{new:true}, (err,userUpdated) => {
                                                if(err) return messageError(res,500,'Server error');
                                                if(userUpdated){
                                                    userUpdated.password = undefined;
                                                    return res.status(200).send({
                                                        token: jwt.createToken(userUpdated),
                                                        userUpdated
                                                    });
                                                }else{  
                                                    return messageError(res,300,'No user matched');
                                                }
                                            });
                                        }else{
                                            return messageError(res,300,'No user match')
                                        }
                                    });
                                }else{
                                    deleteConfirmation(confirmationUpdateEmail._id, (err,removed) => {
                                        if(err) return messageError(res,500,'Server Error')
                                        return messageError(res,300,'User nickname or email already exists');
                                    });                                    
                                }
                            });
                        });
                    });
                }else{
                    return messageError(res,300,'No code match')
                }
            });
        }else{
            return messageError(res,300,'No user match')
        }
    }); 
}
/*
async function insertManyUsers(req,res){
    try{
        for(let i = 0; i < 100 ; i++){
            let userSaved = await User.create(
                {


                    "nick" : "charley11" + i,
                    "name" : "Carlos",
                    "lastName" : "Sur",
                    "email" : "carl11"+ i + "@carlos.com",
                    "password" : "$2a$08$jlnzHxr9sZdZqDCcRVRbTesy7iIvex3wC5hhnec/tVecQd1YGjs3a",
                    "role" : "ROLE_USER",
                    "emailConfirmed" : true,
                    "confirmationCode" : "$2a$10$v56UUTvvI6Lk8qr76xUr/una1sQR7gPSUK296GhSzJXMkVW/UqlgG",
                
                }
            )
        }
        
    }catch(err){
        console.log(err);
        return messageError(res,500,'Creation error')
    }
}
*/
//Insert users automatic

module.exports = {

    saveUser,
    tryConfirmationEmail,
    verifyUser,
    loginUser,
    recoverPasswordEmail,
    recoverPasswordSubmit,
    getUser,
    getUsers,
    updateUser,
    updatingBecauseDiferentEmail
    //insertManyUsers <- used to create manyn users
}



var bcrypt = require('bcryptjs');
var mongoosePaginate = require('mongoose-pagination');
var dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');

const hiddenUser = process.env.EMAIL_USER;
const hiddenPassword = process.env.EMAIL_PASSWORD;


var jwt = require('../services/jwt');

var User = require('../models/user');
var RecoverPassword = require('../models/recoverPassword');

const constService = require('../services/constService');
const emailService = require('../services/emailService');
const { update } = require('../models/user');
const user = require('../models/user');

const messageError = (res,errorId, message) => {
    constService.messageError(res, errorId, message)
};
const ensureAdmin = (req,res,callback) =>{
    constService.ensureAdmin(req,res,callback);
}

const newTransport = (service,emailUser,emailPassword) => {
    return emailService.newTransport(service,emailUser,emailPassword);
};

const sendConfirmationEmail = (transport,senderEmail,receiverName, receiverEmail, confirmationCode) => {
    emailService.sendConfirmationEmail(transport, senderEmail,receiverName, receiverEmail, confirmationCode);
};

const sendResetEmail = (transport,senderEmail,receiverName,receiverEmail,emailCrypt,resetCode) => {
    emailService.sendResetEmail(transport,senderEmail,receiverName,receiverEmail,emailCrypt,resetCode);
};

const g_f_createCode = () => {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let confirmationCode = '';
    for (let i = 0; i < 25; i++) {
        confirmationCode += characters[Math.floor(Math.random() * characters.length )];
    }
    return confirmationCode;
}

const regexLowerCase = (stringToRegex) => {
    let regex = new RegExp(`^${stringToRegex}$`, 'i');
    return regex;
}

const transport = newTransport('Hotmail', hiddenUser, hiddenPassword);
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
        return res.status(300).send({
            message: 'Send all fields'
        });
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
            return res.status(500).send({message:'Request error'});
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
                let confirmationCode = g_f_createCode();

                bcrypt.hash(confirmationCode,roundHashVerification,(err,encryptedCode) => {
                    user.confirmationCode = encryptedCode;
                    user.save((err, userStored) => {
                        if(err) return messageError(res, 500, 'Error at saving user')
                        if(userStored){
    
                            userStored.password = undefined;
                            
                            sendConfirmationEmail(transport,hiddenUser,userStored.name, userStored.email, confirmationCode);

                            return res.status(200).send({
                                userStored
                            });
                        }
                    });                
                });
            });          
        }
    });

}

function verifyUser(req, res){
    let emailParams = req.body.email;
    let codeVerificationParams = req.body.recoverPassword;
    let regexQueryEmail = regexLowerCase(emailParams);
    User.findOne({email:regexQueryEmail}, (err,user) => {
        if(err) return messageError(res, 500, 'Request error');
        if(user){
            bcrypt.compare(codeVerificationParams, user.confirmationCode, (err, match) => {
                if(err) return messageError(res,500,'Server Error');            
                user.emailConfirmed = match;
                user.confirmationCode = '';
                if(user.emailConfirmed){
                    user.save(err => {
                        if(err){
                            return messageError(res, 500, 'Request error');
                        }else{
                            user.password = undefined;
                            return res.status(200).send({
                                user
                            });
                        }
                    });
                }else{
                    return messageError(res,300,'No match Code');
                }
            });
        }else{
            return messageError(res, 404, 'User Not Found');
        }        
    });
}

function loginUser(req, res){
    const roundHash = 8;
    
    var params = req.body;
    var email = params.email;
    var password = params.password;
    User.findOne({email:email},(err, user) => {
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
                        sendResetEmail(transport,hiddenUser,recoverUser.name,recoverUser.email,resetCode);
                        return res.status(200).send({recoverPasswordStored});
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
    
    RecoverPassword.find().populate('user').exec((err,recoversPassword) => {
        if(err) return messageError(res,500, 'Request error');    
        
        if(recoversPassword){
            let recoverUserExists = false;
            let recoverId = '';
            let recoverUser = new User();
            recoversPassword.forEach(element => {
                if(element.user.email == userEmail){
                    recoverUserExists = true;
                    recoverId = element._id;
                    recoverUser = element.user;
                }
            });
            if(recoverUserExists){
                RecoverPassword.find({'_id':recoverId}).deleteOne((err,removed) => {
                    if(err) return messageError(res,500,'Request error');                    
                    if(removed) setRecoverPassword(res,recoverPassword,recoverUser);
                });
            }else{
                newRecover();
            }
        }else{                
            newRecover();
        }
    });
}

function recoverPasswordSubmit(req,res){
    const roundHash = 8;
    const roundHashPasswordCode = 10;
    let params = req.body;
    let email = params.email;
    let recoveryPaswordCode = params.recoveryPasswordCode;
    let newPassword = params.newPassword;
    let userToUpdate = new User();
    
    User.findOne({'email':email}, (error, user)=>{
        if(error) return messageError(res,500,'Server error');
        if(user){
            
            RecoverPassword.findOne({'user': user._id},(err, recoverPassword) => {
                if(err) return messageError(res,500,'Server error');
                
                if(recoverPassword){
                    let recoverPasswordId = recoverPassword._id;
                    bcrypt.compare(recoveryPaswordCode, recoverPassword.recoverCode, (err, check) => {
                        if(recoverPassword.user = user._id){
                            userToUpdate = user;
                            bcrypt.hash(newPassword, roundHash, (err, hash) => {
                                userToUpdate.password = hash;
                                User.findByIdAndUpdate(user._id, userToUpdate,{new: true}, (err, userUpdated) => {
                                    RecoverPassword.find({'_id':recoverPasswordId}).deleteOne((err,recoverPasswordDeleted) => {
                                        if(err) return messageError(res,500,'Server error');
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
            return messageError(res,500,'No user found');
        }
    });

}

function getUser(req,res){
    
    var userId = req.params.id;
    var userSessionId = req.user.sub;
    const findUser = () => {
        User.findById(userId, '-password', (err, user) => {
            if(err) return messageError(res,500, 'Request error');
    
            if(!user) return messageError(res,300, 'User doesn\'t exists');

            return res.status(200).send({user});
        });
    };
    
    if(userId == userSessionId){
        findUser();
        
    }else{        
        ensureAdmin(req,res, () => {
            findUser();
        });
    }    
}

function getUsers(req,res){
    var itemsPerPage = 5;
    var page = 1;
    ensureAdmin(req,res,()=> {    
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
            User.find(null,'-password').sort(sort).paginate(page, itemsPerPage, (err, users, total) => {
                if(err) return messageError(res, 500,'Error en la petición');
                
                if(!users) {
                    return messageError(res, 300, 'No users');
                }else{
                    if(users.length == 0){
                        return messageError(res,300,'No many users');
                    }else{
                        return res.status(200).send({
                            users,
                            total,
                            pages: Math.ceil(total / itemsPerPage)
                        });
                    }
                }                                    
            });
        }
    },
    );
}

function updateUser(req,res){
    let BodyParams = req.body;
    let userRequestId = req.params.UserId;
    let userSessionId = req.user.sub;   
    
    let regexQueryEmail= regexLowerCase(BodyParams.email);
    let regexQueryNick= regexLowerCase(BodyParams.nick);
    delete BodyParams.password;

    if(userSessionId != userRequestId) {
        return messageError(res,300, 'No puedes actualizar el usuario');
    }
    if(BodyParams.email && BodyParams.nick){
        user.email = BodyParams.email
        user.nick = BodyParams.nick
        User.find({ $or:[
            {email: regexQueryEmail},
            {nick: regexQueryNick}
        ]}).exec((err,users) => {
            if(err) return messageError(res,500,'Server error');
            if(users.length == 1 && users[0]._id != req.user.sub || users.length > 1){
                return messageError(res,300,'El usuario ya existe no se actualizó al usuario');
            }else{
                if(req.user.email == user.email){
                    user.findByIdAndUpdate(userSessionId,{$set:BodyParams},{new:true}, (err, userUpdated) => {
                        if (err) return messageError(res,500,'Server Error');
                        if(userUpdated){
                            return res.status(200).send({
                                token: jwt.createToken(user),
                                userUpdated
                            });
                        }else{
                            if (err) return messageError(res,300,'No credentials');
                        }
                    });
                }else{

                }                
            }
        });
    }
    function UpdatingBecauseDiferentEmail(req,res){

    }


}


module.exports = {
    saveUser,
    verifyUser,
    loginUser,
    recoverPasswordEmail,
    recoverPasswordSubmit,
    getUser,
    getUsers,
    updateUser
}


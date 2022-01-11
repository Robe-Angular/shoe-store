const nodemailer = require('nodemailer');
const { callbackPromise } = require('nodemailer/lib/shared');

const service ={
    
    newTransport : (service, emailUser,emailPassword) => {
        return nodemailer.createTransport({
            service: service,
            auth:{
                user: emailUser,
                pass: emailPassword
            }
        });
    },

    sendConfirmationEmail : (transport,senderEmail,receiverName, receiverEmail,confirmationCode,callback) => {
        
            transport.sendMail({
                from: senderEmail,
                to: receiverEmail,
                subject: "Please confirm your count",
                html: `
                    <h1>Email confirmation</h1>
                    <h2>Hello ${receiverName}</h2>
                    <p>Thanks for suscribing. Please confirm your email with te confirmation Code</p>
                    <p>${confirmationCode}</p>
                `
            },(err,info) => {               
                callback(err,info);
            });
        
    },

    sendResetEmail: (transport,senderEmail,receiverName, receiverEmail,resetCode) => {
        transport.sendMail({
            from: senderEmail,
            to: receiverEmail,
            subject: "Password Reset",
            html: `
                <h1>Password reset</h1>
                <h2>Hello ${receiverName}</h2>
                <p>You can reset your password with the code:</p>
                <p>${resetCode}</p>
                <p>The code expires in 2 minutes</p>
                <p>Our store will never ask you for this code, we do not need that information</p>
                <p>Nuestra tienda nunca te pedirá este código, no necesitamos esa información</p>
            `
        });
    },
    sendConfirmationEmailOnUpdating : (transport,senderEmail,receiverName, receiverEmail,confirmationCode) => {
        transport.sendMail({
            from: senderEmail,
            to: receiverEmail,
            subject: "Please confirm your Update",
            html: `
                <h1>Email confirmation</h1>
                <h2>Hello ${receiverName}</h2>
                <p>Thanks for suscribing. Please confirm your email update with te confirmation Code</p>
                <p>${confirmationCode}</p>
            `
        });
    }

}
module.exports = service;
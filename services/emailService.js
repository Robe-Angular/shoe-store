const nodemailer = require('nodemailer');

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

    sendConfirmationEmail : (transport,senderEmail,receiverName, receiverEmail,confirmationCode) => {
        transport.sendMail({
            from: senderEmail,
            to: receiverEmail,
            subject: "Please confirm your count",
            html: `
                <h1>Email confirmation</h1>
                <h2>Hello ${receiverName}</h2>
                <p>Thanks for suscribing. Please confirm your email by clicking on the following</p>
                <p>link: <a href=http://localhost:3800/api/confirm/${confirmationCode}>click here</a></p>
            `
        });
    },

    sendResetEmail: (transport,senderEmail,receiverName, receiverEmail,emailCrypt ,resetCode) => {
        transport.sendMail({
            from: senderEmail,
            to: receiverEmail,
            subject: "Please confirm your count",
            html: `
                <h1>Password reset</h1>
                <h2>Hello ${receiverName}</h2>
                <p>You can reset your password.</p>
                <p><a href=http://localhost:3800/api/reset/${emailCrypt}/${resetCode}>here</a></p>
            `
        });
    }
}
module.exports = service;
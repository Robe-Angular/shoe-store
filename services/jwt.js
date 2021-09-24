'use strict'
var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_de_uso_rudo'; //check middlewares

exports.createToken = function(user){
    
    var payload = {
        sub: user._id,
        name: user.name,
        lastName: user.lastName,
        nick: user.nick,
        email: user.email,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(30,'days').unix()
    };
    return jwt.encode(payload, secret);
}
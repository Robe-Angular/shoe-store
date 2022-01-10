'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = Schema({
    nick: {type: String, default:''},
    name: {type: String, default:''},
    lastName: {type: String, default:''},
    email: {type: String, default:''},
    password: {type: String, default:''},
    role: {type: String, default:''},
    emailNotSended: {type: Boolean, default:false},
    emailConfirmed: {type: Boolean, default:false},
    confirmationCode: {type: String, default: ''},
    telephone: {type: String, default:''},
    createdAt:{type: Date, default: Date.now}
});
module.exports = mongoose.model('User', UserSchema)
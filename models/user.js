'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = Schema({
    nick: {type: String, default:''},
    name: {type: String, default:''},
    lastName: {type: String, default:''},
    numberPairs: {type: Number, default:0},
    priceSum: {type: Number, default:0},
    email: {type: String, default:''},
    password: {type: String, default:''},
    role: {type: String, default:''},
    emailConfirmed: {type: Boolean, default:false},
    confirmationCode: {type: String, default: ''}


});
module.exports = mongoose.model('User', UserSchema)
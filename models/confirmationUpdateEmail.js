'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConfirmationUpdateEmailSchema = Schema({
    user:{type: Schema.ObjectId, ref: 'User'},
    confirmationCode:{type: String, default:''},
    email:{type: String, default:''},
    nick:{type: String, default:''},
    createdAt: { type: Date, expires: '15m', default: Date.now }
});

module.exports = mongoose.model('ConfirmationUpdateEmail', ConfirmationUpdateEmailSchema);
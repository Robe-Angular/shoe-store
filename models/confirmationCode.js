'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConfirmationCode = Schema({
    user:{type: Schema.ObjectId, ref: 'User'},
    confirmationCode:{type: String, default:''},
    createdAt: { type: Date, expires: '15m', default: Date.now }
});

module.exports = mongoose.model('ConfirmationCode', ConfirmationCode);
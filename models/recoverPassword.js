'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecoverPasswordSchema = Schema({
    user:{type: Schema.ObjectId, ref: 'User'},
    recoverCode:{type: String, default:''},
    createdAt: { type: Date, expires: '2m', default: Date.now }
});

module.exports = mongoose.model('RecoverPassword', RecoverPasswordSchema);
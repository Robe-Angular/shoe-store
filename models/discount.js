'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DiscountSchema = Schema({
    applied:{type: Boolean, default:false},
    title:{type: String, default:''},
    description:{type: String, default:''}
    });

module.exports = mongoose.model('ConfirmationUpdateEmail', ConfirmationUpdateEmailSchema);
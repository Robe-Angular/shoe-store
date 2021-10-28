'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FullOrderSchema = Schema({
    user:{type: Schema.ObjectId, ref: 'User'},    
    price:{type: Number, default:0},
    sended:{type: Boolean, default:false},
    received:{type: Boolean, default:false}
});

module.exports = mongoose.model('FullOrder', FullOrderSchema);
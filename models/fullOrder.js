'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FullShoppingCartSchema = Schema({
    user:{type: Schema.ObjectId, ref: 'User'},    
    price:{type: Number, default:0},
    sended:{type: Boolean, default:false},
    solved:{type: Boolean, default:false}
});

module.exports = mongoose.model('FullShoppingCart', FullShoppingCartSchema);
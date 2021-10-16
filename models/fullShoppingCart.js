'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FullShoppingCartSchema = Schema({
    user:{type: Schema.ObjectId, ref: 'User'},    
    originalPrice:{type: Number, default:0},
    priceDiscount:{type: Number, default:0}
});

module.exports = mongoose.model('FullShoppingCart', FullShoppingCartSchema);
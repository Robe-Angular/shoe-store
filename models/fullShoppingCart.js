'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FullShoppingCartSchema = Schema({
    user:{type: Schema.ObjectId, ref: 'User'},    
    originalPrice:{type: number, default:0},
    priceDiscount:{type: number, default:0}
});

module.exports = mongoose.model('FullShoppingCart', FullShoppingCartSchema);
'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FullShoppingCartSchema = Schema({
    user:{type: Schema.ObjectId, ref: 'User'},    
    originalPrice:{type: Number, default:0},
    priceDiscount:{type: Number, default:0},
    paypalId:{type: String, default:''},
    address:{type: Map, of: String},
    height:{type: Number, default:0},
    width:{type: Number, default:0},
    length:{type: Number, default:0},
    weight:{type: Number, default:0}
});

module.exports = mongoose.model('FullShoppingCart', FullShoppingCartSchema);

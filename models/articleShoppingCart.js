'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleShoppingCartSchema = Schema({
    user:{type: Schema.ObjectId, ref: 'User'},
    fullShoppingCart:{type: Schema.ObjectId, ref: 'FullShoppingCart'},
    modelBoot: {type:Schema.ObjectId, ref:'ModelBoot'},
    size:{type: Schema.ObjectId, default:'Size'},
    quantity:{type: Number, default:0}

});

module.exports = mongoose.model('ArticleShoppingCart', ArticleShoppingCartSchema);
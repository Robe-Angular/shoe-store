'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ModelBootSchema = Schema({
    description: {type: String, default:''},
    title: {type: String, default:''},
    color: {type:String, default:''},
    price: {type: Number, default: 0},
    mainImage: {type: String, default: ''},
    images: [String],
    keyWords: [{type:Schema.ObjectId, ref:'KeyWord'}]
});

module.exports = mongoose.model('ModelBoot', ModelBootSchema);
'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ModelBootSchema = Schema({
    description: {type: String, default:''},
    color: {type:String, default:''},
    price: {type: Number, default: 0},
    image: {type: String, default: ''}
});

module.exports = mongoose.model('ModelBoot', ModelBootSchema);
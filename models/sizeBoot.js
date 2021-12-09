'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SizeBootSchema = Schema({
    modelBoot: {type:Schema.ObjectId, ref: 'ModelBoot', default: ''},
    size: {type: Number, default: 0},
    quantity: {type: Number, default: 0},
    width:{type: Number, default: 0},
    height:{type: Number, default: 0},
    length:{type: Number, default: 0},
    weight:{type: Number, default: 0}
});

module.exports = mongoose.model('SizeBoot', SizeBootSchema);
'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SizeBootSchema = Schema({
    modelBoot: {type:Schema.ObjectId, ref: 'ModelBoot', default: ''},
    size: {type: Number, default: 0},
    quantity: {type: Number, default: 0},
    volume:{type: Number, default: 0},
    weight:{type: Number, default: 0}
});

module.exports = mongoose.model('SizeBoot', SizeBootSchema);
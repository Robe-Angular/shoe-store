'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PredefinedVolumeWeightSchema = Schema({
    description: {type: String, default: '', unique: true},
    width:{type: Number, default: 0},
    height:{type: Number, default: 0},
    length:{type: Number, default: 0},
    weight:{type: Number, default: 0}
});

module.exports = mongoose.model('PredefinedVolumeWeight', PredefinedVolumeWeightSchema);
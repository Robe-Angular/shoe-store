'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PredefinedVolumeWeightSchema = Schema({
    description: {type: String, default: '', unique: true},
    volume:{type: Number, default: 0},
    weight:{type: Number, default: 0}
});

module.exports = mongoose.model('PredefinedVolumeWeight', PredefinedVolumeWeightSchema);
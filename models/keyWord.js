'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var KeyWordSchema = Schema({
    string:{type: String, lowercase: true, required: true, unique: true,default:''}
});

module.exports = mongoose.model('KeyWord', KeyWordSchema);
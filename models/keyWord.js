'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var KeyWordSchema = Schema({
    string:{type: String, lowercase: true, required: true, unique: true,default:''},
    categories:[{type: Schema.ObjectId, ref:'KeyWordCategory'}]
});

module.exports = mongoose.model('KeyWord', KeyWordSchema);  
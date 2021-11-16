'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var keyWordCategorySchema = Schema({
    name:{type: String, unique: true, lowercase: true,required: true ,default:''},
    keyWords: [{type:Schema.ObjectId, ref:'KeyWord'}]
});

module.exports = mongoose.model('keyWordCategory', keyWordCategorySchema);
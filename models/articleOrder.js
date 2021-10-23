'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleOrderSchema = Schema({
    user:{type: Schema.ObjectId, ref: 'User'},
    fullOrder:{type: Schema.ObjectId, ref: 'FullOrder'},
    modelBoot: {type:Schema.ObjectId, ref:'ModelBoot'},
    size:{type: Schema.ObjectId, default:'Size'},
    quantity:{type: Number, default:0}
});

module.exports = mongoose.model('ArticleOrder', ArticleOrderSchema);
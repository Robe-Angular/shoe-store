'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AddressSchema = Schema({
    user:{type: Schema.ObjectId, ref: 'User'},
    completeName:{type: String, default: ''},
    telephone:{type: String, default: ''},
    street:{type: String, default: ''},
    locality_2:{type: String, default: ''},//Neighborhood, Quarter or Settlement
    province_2:{type: String, default: ''},//Municipality
    postalCode:{type: String, default: ''},
    locality_1:{type: String, default: ''},//City
    houseNumber:{type: String, default: ''},
    province_1:{type: String, default: ''}//State
});
module.exports = mongoose.model('Address', AddressSchema)
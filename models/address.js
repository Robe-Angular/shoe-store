'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AddressSchema = Schema({
    user:{type: Schema.ObjectId, ref: 'User'},
    completeName:{type: String, default: '', maxLength: 255},
    telephone:{type: String, default: '', maxLength: 255},
    street:{type: String, default: '', maxLength: 255},
    locality_2:{type: String, default: '', maxLength: 255},//Neighborhood, Quarter or Settlement
    province_2:{type: String, default: '', maxLength: 255},//Municipality
    postalCode:{type: String, default: '', maxLength: 255},
    locality_1:{type: String, default: '', maxLength: 255},//City
    houseNumber:{type: String, default: '', maxLength: 255},
    province_1:{type: String, default: '', maxLength: 255}//State
});
module.exports = mongoose.model('Address', AddressSchema)
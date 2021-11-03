const {messageError} = require('../services/constService');
var Address = require('../models/address');

async function getAddresses(req,res){
    try{
        let userId = req.user.sub;
        let addresses = await Address.find({user:userId})
        return res.status(200).send({
            addresses
        });
    }catch(err){
        console.log(err);
    }
}

async function getAddress(req,res){
    try{
        let userId = req.user.sub;
        let addressId = req.params.address;

        let address = await Address.findOne({$and:[{user:userId},{_id:addressId}]})
        return res.status(200).send({
            address
        });
    }catch(err){
        console.log(err);
    }
}

function bodyOnAdress(body,address){
    address.completeName = body.completeName;
    address.telephone = body.telephone;
    address.street = body.street;
    address.locality_2 = body.locality_2;
    address.province_2 = body.province_2;
    address.postalCode = body.postalCode;
    address.locality_1 = body.locality_1;
    address.houseNumber = body.houseNumber;        
    address.province_1 = body.province_1;
    return address;
}

async function saveAddress(req,res){
    try{
        let addressToSave = new Address();
        console.log(addressToSave);
        if( !req.body.completeName || !req.body.telephone || !req.body.street || !req.body.locality_2
            || !req.body.province_2 || !req.body.postalCode || !req.body.locality_1 || !req.body.houseNumber
            || !req.body.province_1) return messageError(res,300,'All fields must be filled');
            

        let body = {
            completeName: req.body.completeName,
            telephone: req.body.telephone,
            street: req.body.street,
            locality_2: req.body.locality_2,//Neighborhood, Quarter or Settlement
            province_2: req.body.province_2,//Municipality
            postalCode: req.body.postalCode,
            locality_1: req.body.locality_1,//City
            houseNumber: req.body.houseNumber,
            province_1: req.body.province_1//State
        }
        
        addressToSave = bodyOnAdress(body,addressToSave);
        console.log(addressToSave);
        addressToSave.user = req.user.sub
        let savedAdress = await addressToSave.save();
        return res.status(200).send({
            savedAdress
        });
        
    }catch(err){
        return messageError(res, 500,'Server error');
    }
}

async function updateAddress(req,res){
    try{
        let userId = req.user.sub;
        let addressId = req.params.addressId;
        if( !req.body.completeName || !req.body.telephone || !req.body.street || !req.body.locality_2
            || !req.body.province_2 || !req.body.postalCode || !req.body.locality_1 || !req.body.houseNumber
            || !req.body.province_1) return messageError(res,300,'All fields must be filled');
            

        let body = {
            completeName: req.body.completeName,
            telephone: req.body.telephone,
            street: req.body.street,
            locality_2: req.body.locality_2,//Neighborhood, Quarter or Settlement
            province_2: req.body.province_2,//Municipality
            postalCode: req.body.postalCode,
            locality_1: req.body.locality_1,//City
            houseNumber: req.body.houseNumber,
            province_1: req.body.province_1//State
        }
        let updatedAddress = await Address.findOneAndUpdate({$and:[{user:userId},{_id:addressId}]},body, {new:true});
        return res.status(200).send({
            updatedAddress
        });
    }catch(err){
        console.log(err);
    }
}

async function deleteAddress(req,res){
    try{
        let userId = req.user.sub;
        let addressId = req.params.addressId;            
        let deletedAddress = await Address.findOneAndDelete({$and:[{user:userId},{_id:addressId}]});
        return res.status(200).send({
            deletedAddress
        });
    }catch(err){
        console.log(err);
    }
}

module.exports = {
    getAddresses,
    getAddress,
    saveAddress,
    updateAddress,
    deleteAddress
}
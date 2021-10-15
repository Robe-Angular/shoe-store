var Discount = require('../models/discount');
const {messageError} = require('../services/constService');

async function saveDiscount(req,res){
    try{
        let discount = new Discount();
        let title = req.body.title;
        let description = req.body.description;
        discount.title = title;
        discount.description = description;
        let discountStored = await discount.save();
        return res.status(200).send({
            discountStored
        });
    }catch(err){
        return messageError(res,500,'Server error');
    }
}

async function booleanAppliedDiscount(req,res){
    try{
        let discountId = req.params.id;
        let value = req.body.value;
        let appliedValue = false;
        appliedValue = (value == 'true')? true: false;
        let update = {
            applied: appliedValue
        }        
        let discountUpdated = await Discount.findByIdAndUpdate(discountId,update,{new:true});
        return res.status(200).send({discountUpdated});
    }catch(err){
        return messageError(res,500,'Server error');
    }
}
//async function deleteDiscount(req,res){

//}

//async function updateDiscount(req,res){
    
//}



module.exports = {
    saveDiscount,
    booleanAppliedDiscount
}
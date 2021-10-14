var Discount = require('../models/modelBoot');
const {messageError} = require('../services/constService');

async function createDiscount(req,res){
    try{
        let discount = new Discount();
        let title = req.body.title;
        let description = req.body.description;
        discount.title = title;
        discount.description = description;
        let discountStored = await discount.save();
    }catch(err){
        return messageError(res,500,'Server error');
    }
}

async function booleanAppliedDiscount(req,res){
    try{
        let discountId = req.params.id;
        let value = req.body.value;
        let appliedValue = false;
        appliedValue = (value = 'true')? true: false;
        let update = {
            applied: appliedValue
        }        
        let discountUpdated = await Discount.findByIdAndUpdate(discountId,update);
    }catch(err){
        return messageError(res,500,'Server error');
    }
}
//async function deleteDiscount(req,res){

}

//async function updateDiscount(req,res){
    
}



module.exports = {
    createDiscount,
    booleanAppliedDiscount
}
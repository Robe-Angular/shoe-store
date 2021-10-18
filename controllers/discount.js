var Discount = require('../models/discount');
var FullShoppingCart = require('../models/fullShoppingCart');
const {messageError} = require('../services/constService');
const {setTotalPricesAndUpdate} = require('../services/articleShoppingCartService');

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

async function updateDiscount(res,discountId,update){
    try{
        let discountUpdated = await Discount.findByIdAndUpdate(discountId,update,{new:true});
        return res.status(200).send({discountUpdated});
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
        var allShoppingCart = await FullShoppingCart.find()
        
        return updateDiscount(res,discountId,update);
        
    }catch(err){
        return messageError(res,500,'Server error');
    }
}

async function updateTitleDescription(req,res){
    try{
        let discountId = req.params.id;
        let titleBody = req.body.title;
        let descriptionBody = req.body.description;
        let update = {
            title: titleBody,
            description: descriptionBody 
        }
        return updateDiscount(res,discountId,update);
    }catch(err){
        return messageError(res,500,'Server error');
    }
};

async function deleteDiscount(req,res){
    try{
        let discountId = req.params.id;
        let deletedDiscount = await Discount.findByIdAndDelete(discountId);
        return res.status(200).send(deletedDiscount);
    }catch(err){
        return messageError(res,500,'Server error');
    }
}

async function getDiscounts(req,res){
    try{        
        let discounts = await Discount.find();
        return res.status(200).send(discounts);
    }catch(err){
        return messageError(res,500,'Server error');
    }
}





module.exports = {
    saveDiscount,
    booleanAppliedDiscount,
    deleteDiscount,
    updateTitleDescription,
    getDiscounts
}
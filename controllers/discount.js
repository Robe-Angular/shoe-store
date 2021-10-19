var Discount = require('../models/discount');
var FullShoppingCart = require('../models/fullShoppingCart');
const {messageError} = require('../services/constService');
const {setTotalPricesAndUpdate} = require('../services/articleShoppingCartService');
const fullShoppingCart = require('../models/fullShoppingCart');

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

async function updateDiscount(discountId,update){
    try{
        let discountUpdated = await Discount.findByIdAndUpdate(discountId,update,{new:true});
        return discountUpdated;
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
        let discountUpdated = await updateDiscount(discountId,update);
        var allShoppingCart = await FullShoppingCart.find().select('id');
        let updatedFullCartArray = [];
        for(let fullShoppingCart of allShoppingCart){
            let fullShoppingCartId = fullShoppingCart._id;
            let fullShoppingCartUpdated = await setTotalPricesAndUpdate(fullShoppingCartId);
            let updatedFullCart = fullShoppingCartUpdated.updatedFullCart;
            updatedFullCartArray.push(updatedFullCart);
        }
        
        
        return res.status(200).send({
            discountUpdated,
            updatedFullCartArray
        });
        
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
        let discountUpdated = await updateDiscount(discountId,update);
        return res.status(200).send({
            discountUpdated
        })
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
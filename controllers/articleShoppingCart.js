const { deleteMany } = require('../models/articleShoppingCart');
var ArticleShoppingCart = require('../models/articleShoppingCart');
var FullShoppingCart = require('../models/fullShoppingCart');
var SizeBoot = require('../models/sizeBoot');
var Discount = require('../models/discount');
const {messageError} = require('../services/constService');
const {iterateOverBodyValidSizes,iterateOverModelsOnFullCart} = require('../services/modelBootService');
const {Mayo} = require('../services/discountService');



async function setTotalPrices(fullShoppingCartId){
    try{
        let totalPrice = 0;
        
        await iterateOverModelsOnFullCart(fullShoppingCartId,(quantity,price) => {
            totalPrice += quantity * price;
        });
        let totalPriceWithDiscount = totalPrice;
        
        let MayoDiscountFinded = await Discount.findOne({title:'Mayo'});
        let MayoDiscountValue = await Mayo(fullShoppingCartId);
        totalPriceWithDiscount = (MayoDiscountFinded.applied) ? MayoDiscountValue:totalPrice;
        return {totalPrice,totalPriceWithDiscount};        
    }catch(err){
        console.log(err);
    }
}

async function saveOnCart(req,res){
    try{
        let modelId = req.params.modelId;
        let body = req.body;
        let articleShoppingCartArray = [];
        let userId = req.user.sub;

        let deleteItemsUserModel = await ArticleShoppingCart.deleteMany({modelBoot: modelId,user:userId });
        
        let prices = {};
        let fullCartId = '';
        await iterateOverBodyValidSizes(modelId,body, async (sizeElement,keyElement) => {
            let bodyValue = parseInt(body[keyElement]);
            let sizeId = sizeElement._id;
            let sizeQuantity = parseInt(sizeElement.quantity);
            let quantity = (bodyValue <= sizeQuantity) ? bodyValue : sizeQuantity;

            let articleCart = new ArticleShoppingCart();
            articleCart.modelBoot = modelId;
            articleCart.user = userId;
            articleCart.size = sizeId;
            articleCart.quantity = quantity;
            let fullCartExists = await FullShoppingCart.find({user:userId});

            if(fullCartExists.length > 0){
                fullCartId = fullCartExists[0]._id;

            }else{                
                
                let fullShoppingCart = new FullShoppingCart();
                fullShoppingCart.user = userId;
                let newFullCart = await fullShoppingCart.save();
                fullCartId = newFullCart._id;
            }

            articleCart.fullShoppingCart = fullCartId;
            let saveArticleOnCart = await articleCart.save();
            articleShoppingCartArray.push(saveArticleOnCart);
        });              

        
        prices = await setTotalPrices(fullCartId);
        //Update full cart
        let updateFullCart = {
            originalPrice: prices.totalPrice,
            priceDiscount: prices.totalPriceWithDiscount
        }
        let updatedFullCart = await FullShoppingCart.findByIdAndUpdate(fullCartId,updateFullCart,{new:true});
        let itemsOnFullCart = await ArticleShoppingCart.find({fullShoppingCart:fullCartId});
        return res.status(200).send({
            articleShoppingCartArray,
            updatedFullCart,
            itemsOnFullCart
            
        });
    }catch(err){
        console.log(err);
        return messageError(res,300,'Server Error');
    }
}
module.exports = {
    saveOnCart
}


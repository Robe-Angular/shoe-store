var ArticleShoppingCart = require('../models/articleShoppingCart');
var FullShoppingCart = require('../models/fullShoppingCart');
var SizeBoot = require('../models/sizeBoot');
var ArticleOrder = require('../models/ArticleOrder');
var FullOrder = require('../models/FullOrder');
const {messageError} = require('../services/constService');
const {iterateOverBodyValidSizes, iterateOverModelsOnFullCart} = require('../services/modelBootService');
const {createPaypalOrder,capturePaypalOrder} = require('../services/paypalService');
const {setTotalPricesAndUpdate} = require('../services/articleShoppingCartService');
const { findById } = require('../models/articleShoppingCart');


async function saveOnCart(req,res){
    try{
        let modelId = req.params.modelId;
        let body = req.body;
        let articleShoppingCartArray = [];
        let userId = req.user.sub;

        let deleteItemsUserModel = await ArticleShoppingCart.deleteMany({modelBoot: modelId,user:userId });

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

        
        let functionUpdate = await setTotalPricesAndUpdate(fullCartId);
        let updatedFullCart = functionUpdate.updatedFullCart;
        let itemsOnFullCart = functionUpdate.itemsOnFullCart;
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

async function removeFullCartUser(req,res){
    try{
        let userId = req.user.sub;
        let deletedFullCart = await FullShoppingCart.deleteMany({user:userId});
        let deletedItemsCart = await ArticleShoppingCart.deleteMany({user:userId});
        return res.status(200).send({
            deletedFullCart,
            deletedItemsCart
        });
    }catch(err){
        return messageError(res,500,'Server error');
    }
}

async function removeFullCartAdmin(req,res){
    try{
        let fullShoppingCartId = req.params.fullShoppingCartId;
        let deletedFullCart = await FullShoppingCart.findByIdAndDelete(fullShoppingCartId);
        let deletedItemsCart = await ArticleShoppingCart.deleteMany({fullShoppingCart:fullShoppingCartId});
        return res.status(200).send({
            deletedFullCart,
            deletedItemsCart
        });
    }catch(err){
        return messageError(res,500,'Server error');
    }
}

async function removeItem(req,res){
    try{
        let userId = req.user.sub;
        let modelId = req.params.modelId;
        let deletedItems = await ArticleShoppingCart.deleteMany({user: userId, modelBoot:modelId});
        let fullCart = await FullShoppingCart.findOne({user: userId});
        let fullCartId = fullCart._id;
        let functionUpdate = await setTotalPricesAndUpdate(fullCartId);
        let updatedFullCart = functionUpdate.updatedFullCart;
        let itemsOnFullCart = functionUpdate.itemsOnFullCart;

        return res.status(200).send({
            deletedItems,
            updatedFullCart,
            itemsOnFullCart
        });
    }catch(err){
        return messageError(res,500,'Server error');
    }
}

async function paypalCreate(req,res){
    try{
        let userId = req.user.sub;
        let fullShoppingCart = await FullShoppingCart.findOne({user:userId});
        let fullShoppingCartPrice = fullShoppingCart.priceDiscount;
        
        let createOrder = await createPaypalOrder(fullShoppingCartPrice);
        let paypalId = createOrder.id;
        let updateFullShoppingCart = await FullShoppingCart.findByIdAndUpdate(fullShoppingCart.id,{paypal:paypalId});
        return res.status(200).send({createOrder});
    }catch(err){
        return messageError(res,500,'Server error');
    }
}

async function tryBuy(req,res){
    try{        
        let orderId = req.params.orderId;
        
        let userId = req.user.sub;
        let fullShoppingCart = await FullShoppingCart.findOne({user:userId});
        let fullShoppingCartId = fullShoppingCart._id;
        if(fullShoppingCart.paypal != orderId) return messageError(res,300,'Paypal ID doesn\'t match');
        let articleShoppingCartArray = await ArticleShoppingCart.find({fullShoppingCart: fullShoppingCartId});
        let insufficient = false;
        for(let elementArticle of articleShoppingCartArray){
            let elementArticleId = elementArticle._id;
            let elementArticleSize = elementArticle.size;
            let elementArticleQuantity = parseInt(elementArticle.quantity);
            let sizeOnDB = await SizeBoot.findById(elementArticleSize);
            let sizeStock = parseInt(sizeOnDB.quantity);
            if(elementArticleQuantity > sizeStock){
                insufficient = true;                
                elementArticle.quantity = sizeStock;
                let updateElementArticle = await ArticleShoppingCart.findByIdAndUpdate(elementArticleId,elementArticle);
            }
        }
        if(insufficient){
            let updateFullCartPaypal = await FullShoppingCart.findByIdAndUpdate(fullShoppingCartId,{paypal:''});
            let updateFullCartPrice = await setTotalPricesAndUpdate(fullShoppingCartId);
            let updatedFullCart = updateFullCartPrice.updatedFullCart;
            let itemsOnFullCart = updateFullCartPrice.itemsOnFullCart;
            return res.status(300).send({
                updatedFullCart,
                itemsOnFullCart,
                message:'Insufficient on stock'
            })
        }else{
            let captured = await capturePaypalOrder(orderId);
            console.log(captured);
            if(captured.status != 'COMPLETED') return messageError(res,300,'Order not Approved');
            let fullOrder = new FullOrder();
            fullOrder.price = fullShoppingCart.priceDiscount;
            fullOrder.user = userId;
            let createdFullOrder = await fullOrder.save();
            let articleOrderStored = [];

            for(let elementArticle of articleShoppingCartArray){
                let articleOrder = new ArticleOrder();
                articleOrder.user = userId;
                articleOrder.fullOrder = createdFullOrder._id;
                articleOrder.modelBoot = elementArticle.modelBoot;
                articleOrder.size = elementArticle.size;
                articleOrder.quantity = elementArticle.quantity;
                let createdArticleOrder =await articleOrder.save();
                articleOrderStored.push(createdArticleOrder);
                
                let sizeToUpdate = await SizeBoot.findById(articleOrder.size);
                let newQuantity = parseInt(sizeToUpdate.quantity) - articleOrder.quantity;
                let updatedSize = await SizeBoot.findByIdAndUpdate(elementArticle.size,{quantity: newQuantity});                

            }
            let deletedFullCart = await FullShoppingCart.deleteMany({user:userId});
            let deletedItemsCart = await ArticleShoppingCart.deleteMany({user:userId});
            
            return res.status(200).send({articleOrderStored,createdFullOrder});
            
        }
    }catch(err){
        console.log(err)
    }
}


module.exports = {
    saveOnCart,
    removeFullCartAdmin,
    removeFullCartUser,
    removeItem,
    paypalCreate,
    tryBuy
}


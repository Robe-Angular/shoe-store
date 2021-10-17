var ArticleShoppingCart = require('../models/articleShoppingCart');
var FullShoppingCart = require('../models/fullShoppingCart');
var SizeBoot = require('../models/sizeBoot');
const {messageError} = require('../services/constService');
const {iterateOverBodyValidSizes} = require('../services/modelBootService');


async function saveOnCart(req,res){
    try{
        let modelId = req.params.modelId;
        let body = req.body;
        let articleShoppingCartArray = [];
        let userId = req.user.sub;
        await iterateOverBodyValidSizes(modelId,body, async (sizeElement,keyElement) => {
            let bodyValue = parseInt(body[keyElement]);
            let sizeId = sizeElement._id;
            let sizeQuantity = parseInt(sizeElement.quantity);
            let quantity = (bodyValue <= sizeQuantity) ? bodyValue : sizeQuantity;
            let articleCart = new ArticleShoppingCart();
            articleCart.user = userId;
            articleCart.size = sizeId;
            articleCart.quantity = quantity;

            let fullCartExists = await FullShoppingCart.find({user:userId});
            let fullCartId = '';
            if(fullCartExists > 0){
                fullCartId = fullCartExists._id;
            }else{                
                let fullShoppingCart = new FullShoppingCart();
                let newFullCart = await fullShoppingCart.save()
                fullCartId = newFullCart._id;
            }
            articleCart.fullShoppingCart = newFullCartId;
            let saveArticleOnCart = await articleCart.save();
            articleShoppingCart.push();
        });              
        return res.status(200).send({
            articleShoppingCart
        });
    }catch(err){
        return messageError(res,300,'Server Error');
    }
}
module.exports = {
    saveOnCart
}
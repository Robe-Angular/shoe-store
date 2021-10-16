var ArticleShoppingCart = require('../models/articleShoppingCart');
var FullShoppingCart = require('../models/fullShoppingCart');
var SizeBoot = require('../models/sizeBoot');
const {messageError} = require('../services/constService');

async function saveOnCart(req,res){
    try{
        let modelId = req.params.modelId;
        let body = req.body;

        const keysBody = Object.keys(body);
        const sizes = SizeBoot.find
        for(const keyElement of keysBody){
            let keySliced = keyElement.slice(1);
        }

        
    }catch(err){

    }
}
module.exports = {
    saveOnCart
}
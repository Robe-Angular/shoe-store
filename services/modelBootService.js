var SizeBoot = require('../models/sizeBoot');
var ArticleShoppingCart = require('../models/articleShoppingCart');
var ModelBoot = require('../models/modelBoot');
const service ={

    iterateOverBodyValidSizes: async (modelId,body,callbackIterate) => {
        try{
            const sizes = await SizeBoot.find({modelBoot:modelId});                 
            const keysBody = Object.keys(body);
            for(const keyElement of keysBody){
                for(let sizeElement of sizes){
                    if (sizeElement.size == keyElement){                             
                        await callbackIterate(sizeElement,keyElement); //Await Important! :o
                    }
                }
            }
        }catch(err){
            console.log(err);
        }
            
    },
    iterateOverModelsOnFullCart: async (fullShoppingCartId, functionCallback) => {
        let articleShoppingCartArray = await ArticleShoppingCart.find({fullShoppingCart:fullShoppingCartId});
        let modelsOnArray = [];
        for(let elementArticleCart of articleShoppingCartArray){
            let elementModel = elementArticleCart.modelBoot;
            let modelIncluded = false;
            for(elementModelOfArray of modelsOnArray){
                let stringElementModelOfArray = elementModelOfArray.toHexString();
                let stringElementModel = elementModel.toHexString();
                modelIncluded = (stringElementModel == stringElementModelOfArray);
            }

            if(!modelIncluded){
                modelsOnArray.push(elementModel);
            }
        }
        for(let elementModel of modelsOnArray){
            let model = await ModelBoot.findById(elementModel);
            let modelPrice = model.price;
            let modelQuantity = 0;
            for(elementArticleCart of articleShoppingCartArray){
                modelQuantity = (elementArticleCart.modelBoot.toHexString() != elementModel) ? modelQuantity : modelQuantity + parseInt(elementArticleCart.quantity);
            }
            await functionCallback(modelQuantity, modelPrice);
        }
        
    },
    addOrSubtractByBodyModelBoot: async(modelId,body,addOrSubtract) => {
        try{           
            let arraySizesStored = [];
            await service.iterateOverBodyValidSizes(modelId,body, async (sizeElement,keyElement) => {
                let newQuantityAdd = parseInt(sizeElement.quantity) + parseInt(body[keyElement]);
                let newQuantitySubtract = parseInt(sizeElement.quantity) - parseInt(body[keyElement]);
                let newQuantity = addOrSubtract ? newQuantityAdd : newQuantitySubtract;
                let sizeElementId = sizeElement._id;
                const sizeUpdated = await SizeBoot.findByIdAndUpdate(sizeElementId,{quantity:newQuantity},{new:true});
                arraySizesStored.push(sizeUpdated);
            });        
            
            return arraySizesStored;
            
        }catch(err){
            console.log(err);
        }
    }

}
module.exports = service;
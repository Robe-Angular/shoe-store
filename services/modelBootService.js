var SizeBoot = require('../models/sizeBoot');
const service ={

iterateOverBodyValidSizes: async (modelId,body,callbackIterate) => {
        const sizes = await SizeBoot.find({modelBoot:modelId});                 
        const keysBody = Object.keys(body);
        for(const keyElement of keysBody){
            let keySliced = parseInt(keyElement.slice(1));
            for(let sizeElement of sizes){
                if (sizeElement.size == keySliced){                             
                    await callbackIterate(sizeElement,keyElement); //Await Important! :o
                }
            }
        }
        
    }
}
module.exports = service;
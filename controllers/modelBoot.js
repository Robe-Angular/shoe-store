'use strict'
var mongoosePaginate = require('mongoose-pagination');

var ModelBoot = require('../models/modelBoot');
var SizeBoot = require('../models/sizeBoot');

const {messageError, ensureAdmin} = require('../services/constService');


function saveModelBoot(req,res){
    ensureAdmin(req,res,() =>{
        var params = req.body;
        var modelBoot = new ModelBoot();

        modelBoot.description = params.description;
        modelBoot.color = params.color;
        modelBoot.price = params.price;
        
        var minSize = params.minSize;
        var maxSize = params.maxSize;
        if(minSize <= maxSize ){
            modelBoot.save((err, modelBootStored) => {
                let sizesBoot = [];
                for(let i = minSize; i<= maxSize;  i++){
                    let sizeBoot = new SizeBoot();
                    sizeBoot.modelBoot = modelBootStored._id;
                    sizeBoot.size = i;
                    sizesBoot.push(sizeBoot);
                };
                SizeBoot.create(sizesBoot,(err, sizesBootStored) => {
                    if(err){
                        return messageError(res,300,'Request error');
                    }else{
                        if(sizesBootStored){
                            return res.status(200).send({
                                sizesBootStored
                            });
                        }
                    }
                });
            });
        }else{
            return messageError(res,200,'Min size must be smaller');
        }
    });
}

module.exports = {
    saveModelBoot    
}

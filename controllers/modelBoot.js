'use strict'
var mongoosePaginate = require('mongoose-pagination');

var ModelBoot = require('../models/modelBoot');
var SizeBoot = require('../models/sizeBoot');
var mongoose = require('mongoose');

const {messageError, ensureAdmin} = require('../services/constService');

const findModelSizes = (res,modelId,functionCallback) => SizeBoot.find({modelBoot:modelId},(err,sizes) => {

    if(err) return messageError(res,500,'Server error');
    if(sizes){
        functionCallback(sizes);
    }else{
        return messageError(res,300,'No sizes');
    }
});


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
function getModelBootQuantity(req,res){
    let modelId = req.params.modelId;
    findModelSizes(res, modelId, (sizes) => {
        return res.status(200).send({sizes});
    });
}

function getAllModelsQuantity(req,res){
}

function addModelBoot(req,res){
    ensureAdmin(req,res, () => {
        let modelId = req.params.modelId;

    });
}

module.exports = {
    saveModelBoot,
    getModelBootQuantity

}

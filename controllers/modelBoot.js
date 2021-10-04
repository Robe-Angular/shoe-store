'use strict'
var mongoosePaginate = require('mongoose-pagination');

var ModelBoot = require('../models/modelBoot');
const sizeBoot = require('../models/sizeBoot');
var SizeBoot = require('../models/sizeBoot');
const {messageError} = require('../services/constService');

const findModelSizes = (res,modelId,functionCallback) => SizeBoot.find({modelBoot:modelId},(err,sizes) => {

    if(err) return messageError(res,500,'Server error');
    if(sizes.length > 0){
        functionCallback(sizes);
    }else{
        return messageError(res,300,'No sizes');
    }
});


function saveModelBoot(req,res){

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
}

function getModelBootQuantity(req,res){
    let modelId = req.params.modelId;
    findModelSizes(res, modelId, (sizes) => {
        return res.status(200).send({sizes});
    });
}

function getAllModels(req,res){
    let page = 1;
    let itemsPerPage = 4;
    if(req.params.page){
        page = req.params.page
    }
    let sort = '_id';
    if(req.params.sort){
        sort = req.params.sort            
    }
    ModelBoot.find().sort(sort).paginate(page, itemsPerPage, (err,modelBoots, total) => {
        if(err) messageError(res,500,'Request error');
        if(modelBoots){
            return res.status(200).send({
                modelBoots,
                total,
                pages: Math.ceil(total / itemsPerPage)
            });
        }
    });
}

async function addOrSubtractModelBoot(modelId,body,addOrSubtract){
    try{
        const sizes = await SizeBoot.find({modelBoot:modelId});         
        let arraySizesStored = [];
        const keysBody = Object.keys(body);
        for(const key of keysBody){
            let keySliced = parseInt(key.slice(1));
            //sizes[keySliced].quantity = req.body[key];  
            for(let sizeElement of sizes){
                if (sizeElement.size == keySliced){         
                    
                    let newQuantityAdd = parseInt(sizeElement.quantity) + parseInt(body[key]);
                    let newQuantitySubtract = parseInt(sizeElement.quantity) - parseInt(body[key]);
                    let newQuantity = addOrSubtract ? newQuantityAdd : newQuantitySubtract;
                    let sizeElementId = sizeElement._id;
                    const sizeUpdated = await SizeBoot.findByIdAndUpdate(sizeElementId,{quantity:newQuantity},{new:true});
                    arraySizesStored.push(sizeUpdated);
                }
            }
        }
        return arraySizesStored;
        
    }catch(error){   
        console.log(error);
        return 'error';
    }
}

async function addModelBoot(req,res){
    let modelId = req.params.modelId;
    let body = req.body;
    let arraysStored = await addOrSubtractModelBoot(modelId,body,true);
    return res.status(200).send({
        arraysStored
    });
}
async function subtractModelBoot(req,res){
    let modelId = req.params.modelId;
    let body = req.body;
    let arraysStored = await addOrSubtractModelBoot(modelId,body,true);
    return res.status(200).send({
        arraysStored
    });
}
module.exports = {
    saveModelBoot,
    getModelBootQuantity,
    getAllModels,
    addModelBoot,
    subtractModelBoot
}


'use strict'
var mongoosePaginate = require('mongoose-pagination');
const modelBoot = require('../models/modelBoot');

var ModelBoot = require('../models/modelBoot');
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

async function updateModelBoot(req,res){
    try{
        let minSizeBody = parseInt(req.body.minSize);
        let maxSizeBody = parseInt(req.body.maxSize);
        let modelId = req.params.modelId;
        
        if(minSizeBody > maxSizeBody) return messageError(res,300,'Min size is larger than Max size');
                
        console.log(minSizeBody > maxSizeBody);
        
        const getMaxMin = (sizes) => {
            let minSize = 10000;
            let maxSize = 0;
            for(let size of sizes){
                minSize = (parseInt(size.size) < parseInt(minSize)) ? parseInt(size.size) : parseInt(minSize);
                maxSize = (parseInt(size.size) > parseInt(maxSize)) ? parseInt(size.size) : parseInt(maxSize);
            }
            return [maxSize,minSize];
        }

        const sizesDB = await SizeBoot.find({modelBoot:modelId});
        
        let maxMinDB = getMaxMin(sizesDB);
        let maxDB = maxMinDB[0];
        let minDB = maxMinDB[1];
        const saveSize = async (sizeInt,modelId) => {
            let sizeBoot = new SizeBoot();
            sizeBoot.size = sizeInt;
            sizeBoot.modelBoot = modelId;
            let savedSize = await sizeBoot.save();
        }
        const deleteSize = async (sizeInt, modelId) =>{ 
            let deletedSize = await SizeBoot.deleteOne({modelBoot:modelId, size: sizeInt});
        }
        if(maxDB < maxSizeBody){
            for(let i = maxDB; i <= maxSizeBody; i++){
                saveSize(i,modelId);
            }
        }
        else{
            for(let i = maxSizeBody + 1 ; i <= maxDB; i++){

                deleteSize(i,modelId);
            }
        }
        if(minDB > minSizeBody){
            for(let i = minSizeBody; i <= minDB; i++){
                saveSize(i,modelId);
            }
        }
        else{
            for(let i = minDB ; i <= (maxDB - 1); i++){
                deleteSize(i,modelId);
            }
        }

        let fieldsUpdate={
            price: req.body.price,
            description: req.body.description,
            color: req.body.color
        };
        
        const modelUpdated = await ModelBoot.findByIdAndUpdate(modelId, fieldsUpdate,{new:true});
        
        return res.status(200).send({
            modelUpdated
        });
    }catch(err){
        console.log(err);
        return messageError(res,200,'Server error');
    }
}

async function deleteModelBoot(req,res){
    try{
        let modelId = req.params.modelId;
        const modelDeleted = await ModelBoot.find({_id:modelId}).deleteOne();
        const sizesDeleted = await SizeBoot.find({modelBoot:modelId}).deleteMany();

        return res.status(200).send({
            modelDeleted,
            sizesDeleted
        });
    }catch(err){
        console.log(err);
        return messageError(res,200,'Server error');
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
    updateModelBoot,
    deleteModelBoot,
    getModelBootQuantity,
    getAllModels,
    addModelBoot,
    subtractModelBoot
}


'use strict'
var mongoosePaginate = require('mongoose-pagination');
var fs= require('fs');
const util = require('util');
const unlink = util.promisify(fs.unlink);
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
    modelBoot.title = params.title;
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
                            sizesBootStored,
                            modelBootStored
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
        
        let fieldsUpdate={
            price: req.body.price,
            description: req.body.description,
            title: req.body.title,
            color: req.body.color,
        };
        
        const modelUpdated = await ModelBoot.findByIdAndUpdate(modelId, fieldsUpdate,{new:true});
        
        if(minSizeBody > maxSizeBody) return messageError(res,300,'Min size is larger than Max size');
        if(!modelUpdated) return messageError(res,300,'Model doesn´t exists');        
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
        for (let i = minSizeBody; i <= maxSizeBody; i++){
            let sizeBodyExists = false;
            for(let size of sizesDB){
                if(size.size == i){
                    sizeBodyExists = true;
                }                
            }
            if(!sizeBodyExists){
                saveSize(i,modelId);
            }
        }
        for (let i = minDB; i <= maxDB; i++){
            let sizeBodyExists = false;
            for(let j = minSizeBody; j <= maxSizeBody; j++){
                if(i == j){
                    sizeBodyExists = true
                }
            }
            if(!sizeBodyExists){
                deleteSize(i,modelId);
            }
        }
       
        return res.status(200).send({
            modelUpdated
        });
    }catch(err){
        console.log(err);
        return messageError(res,200,'Server error');
    }
}

async function uploadImages(req,res){
    let file_name = 'No upload';
        
    let modelId = req.params.modelId;
    var validationRegex = new RegExp("^[0-9a-fA-F]{24}$");
    let idValid = validationRegex.test(modelId); // false

    if(JSON.stringify(req.files) == '{}'){
        return res.status(404).send({
            status: 'error',
            message: file_name
        });	
    }			
    let reqFiles = req.files;
    let arrayUnlinked = [];
    let arrayFiles = [];
    
    
    try {        
        if (reqFiles.file0.length == undefined){
            arrayFiles.push(reqFiles.file0);
        }else{
            arrayFiles = reqFiles.file0;
        }
        let modelBoot = null;   
        if(idValid){
            modelBoot = await ModelBoot.findById(modelId);
        }
        var updatedModelBoot = new ModelBoot();

        for(let file of arrayFiles){
            //Conseguir el nombre y la extensión del archivo
            let file_path = file.path;
            let file_split = file_path.split('\\');

            //**Ansagee** linux oder Mac 
            // --->   var file_split = file_path.split('/');
            //Dateiname
            file_name = file_split[2];

            //Extensión del archivo
            let ext_split = file_name.split('\.');
            let file_ext = ext_split[1];
            if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif' || !modelBoot ||!idValid){
                const unlinked = await unlink(file_path);
                arrayUnlinked.push(file_name);
                
                    
            }else{                
                if(modelBoot.images.length == 0){
                    modelBoot.mainImage = file_name;
                }
                modelBoot.images.push(file_name);            
                updatedModelBoot = await ModelBoot.findByIdAndUpdate(modelId,modelBoot,{new:true});
            }
        }
        return res.status(200).send({
            updatedModelBoot,
            arrayUnlinked
        });        
        
    }catch (err){
        
        const values = Object.values(reqFiles);    
        console.log(values[0]);
        for(let file of values[0]){
            //Conseguir el nombre y la extensión del archivo
            console.log(file);
            let file_path = file.path;
            let file_split = file_path.split('\\');
            file_name = file_split[2];
            let ext_split = file_name.split('\.');

            const unlinked = await unlink(file_path);
            arrayUnlinked.push(file_name);

        }
        
        return messageError(res,500, 'Server error check input file as file0');
    }
}

async function deleteUpload(req,res) {
    try {   
       let imageName = req.params.image;
        let modelId = req.params.modelId;
        let file_path = './uploads/models/' + imageName;
        const modelBoot = await ModelBoot.findById(modelId);
        if(!modelBoot) return messageError(res,300,'No model match');
        let arrayTofilter = modelBoot.images;
        let arrayFiltered = arrayTofilter.filter(element => element != imageName);
        let imageExists = (arrayTofilter != arrayFiltered);
                
        if(imageExists){
            modelBoot.images = arrayFiltered;
            const modelBootUpdated = await ModelBoot.findByIdAndUpdate(modelId,modelBoot, {new:true});
            fs.unlink(file_path, (err) => {
                return res.status(200).send({modelBootUpdated, file_path});
            });
            
            
        }
    }catch(err){
        console.log(err);
        return messageError(res,300,'Server error');

    }

    
}

async function setMainImage(req, res){
    try{
        let modelId = req.params.modelId;
        let fileName = req.params.image;
        const modelBoot = await ModelBoot.findById(modelId);
        console.log(modelBoot);
        if(!modelBoot) return messageError(res,300,'Invalid modelId');
        let includes = modelBoot.images.includes(fileName);
        
        if(includes){
            let UploadObject= {mainImage: fileName};
            let modelBootUpdated = await ModelBoot.findByIdAndUpdate(modelId, UploadObject, {new: true});
            
            return res.status(200).send({modelBootUpdated});
        }else{
            return messageError(res,300,'Invalid file name');
        }
    }catch(err){
        console.log(err);
        return messageError(res,500,'Server error');
    }
}

async function deleteModelBoot(req,res){
    try{
        const pathBase = './uploads/models/';
        let modelId = req.params.modelId;

        const modelToUnlink = await ModelBoot.findById(modelId);
        let images = modelToUnlink.images;
        console.log(images);
        let unlinkedFiles = [];
        for(let file of images){
            let path = pathBase + file;
            try{
                const unlinked = await unlink(path);
                
            }catch (err){
                
            }
            unlinkedFiles.push(file);
            
        }
        const modelDeleted = await ModelBoot.find({_id:modelId}).deleteOne();
        const sizesDeleted = await SizeBoot.find({modelBoot:modelId}).deleteMany();


        return res.status(200).send({
            modelDeleted,
            sizesDeleted,
            unlinkedFiles
        });
    }catch(err){
        console.log(err);
        return messageError(res,200,'Server error');
    }
}


function getModelBootQuantity(req,res){
    let modelId = req.params.modelId;
    ModelBoot.findById(modelId,(err,modelBoot)=> {
        if(err) return messageError(res,500,'Server error');

        findModelSizes(res, modelId, (sizes) => {
        
            return res.status(200).send({sizes,modelBoot});
        });
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
    uploadImages,
    setMainImage,
    deleteUpload,
    deleteModelBoot,
    getModelBootQuantity,
    getAllModels,
    addModelBoot,
    subtractModelBoot
}




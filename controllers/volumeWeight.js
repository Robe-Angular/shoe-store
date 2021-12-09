const {messageError} = require('../services/constService');
var PredefinedVolumeWeight = require('../models/predefinedVolumeWeight');
var SizeBoot = require('../models/sizeBoot');

async function createPredefinedVolumeWeight(req,res){
    try{
        let weight = req.params.weight;
        let height = req.params.height;
        let width = req.params.width;
        let length = req.params.length;
        let description = req.body.description;

        let saveObject =  {
            weight: weight,
            width: width,
            length: length,
            height: height,
            description: description
        }

        let predefinedVolumeWeight = new PredefinedVolumeWeight(saveObject);

        let predefinedVolumeWeightSaved = await predefinedVolumeWeight.save();
        return res.status(200).send({
            predefinedVolumeWeightSaved
        });
    }catch(err){
        console.log(err);
        return messageError(res,500,'Server error');
    }
}
async function insertVoluemeWeightToSizes(req,res){
    try{
        let width = req.body.width;
        let height = req.body.height;
        let length = req.body.length;
        let weight = req.body.weight;
        let modelBootId = req.params.modelBootId;
        let minSize = parseInt(req.body.minSize);
        let maxSize = parseInt(req.body.maxSize);

        if(minSize > maxSize) return messageError(res,300,'minSize must be lower than maxSize');
        let sizes = await SizeBoot.find({modelBoot:modelBootId});
        let sizesUpdated = [];
        for(let sizeBoot of sizes){
            let sizeNumber = sizeBoot.size;
            let sizeId = sizeBoot._id;
            if(sizeNumber >= minSize && sizeNumber <= maxSize){
                let sizeUpdated = await SizeBoot.findByIdAndUpdate(sizeId,{
                    width:width,
                    height:height,
                    length:length,
                    weight:weight,
                }, {new:true});
                sizesUpdated.push(sizeUpdated);
            }
        }
        return res.status(200).send({
            sizesUpdated
        });

    }catch(err){
        console.log(err);
        return messageError(res,500,'Server error')
    }
}

async function deletePredefinedVolumeWeight(req,res){
    try{
        
        let predefined_v_w_id = req.params.predefined_v_w_id;

        let predefined_v_w_deleted = await PredefinedVolumeWeight.findOneAndDelete({
                $and:[
                    {_id:predefined_v_w_id},
                    {description:{$ne:'default'}}
                ]}
            );
        return res.status(200).send({
            predefined_v_w_deleted
        });

    }catch(err){
        console.log(err);
        return messageError(res,500,'Server error');
    }
}

module.exports = {
    createPredefinedVolumeWeight,
    deletePredefinedVolumeWeight,
    insertVoluemeWeightToSizes
}


const {messageError} = require('../services/constService');
var PredefinedVolumeWeight = require('../models/predefinedVolumeWeight');
var SizeBoot = require('../models/sizeBoot');

async function createPredefinedVolumeWeight(req,res){
    try{
        let weight = req.params.weight;
        let volume = req.params.volume;
        let description = req.body.description;

        let saveObject =  {
            weight: weight,
            volume: volume,
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
    deletePredefinedVolumeWeight
}

var KeyWordCategory = require('../models/keyWordCategory');
var KeyWord = require('../models/keyWord');
var ModelBoot = require('../models/modelBoot');
const { messageError } = require('../services/constService');
const keyWord = require('../models/keyWord');

async function createKeyWord(req,res){
    try{

        let keyWordString = req.body.string;
        let keyWordToSave = new KeyWord();
        keyWordToSave.string = keyWordString;
        let keyWord = await keyWordToSave.save();
        return res.status(200).send({
            keyWord
        });

    }catch(err){
        return messageError(res,300,'There was an error')
    }
}

async function searchKeyWord(req,res){
    try{
        let stringToSearch = req.body.search;
        let keyWords = await keyWord.find({string:{$regex:stringToSearch}});
        return res.status(200).send({
            keyWords
        });
    }catch(err){
        console.log(err);
        return messageError(res,500,'Server Error')
    }
    
}

async function deleteKeyWord(req,res){
    try{
        let keyWordId = req.params.keyWordId;
        
        let categoriesWithKeyWord = await KeyWordCategory.find({keyWords:keyWordId});
        let modelBootsWithKeyWord = await ModelBoot.find({keyWords:keyWordId});
        let penuriousKeyWord = await KeyWord.findByIdAndDelete(keyWordId);
        for(let category of categoriesWithKeyWord){
            let categoryUpdated = await KeyWordCategory.findByIdAndUpdate(category._id,{$pull: {keyWords: keyWordId}});
        }
        for(let modelBoot of modelBootsWithKeyWord){
            let modelBootUpdated = await ModelBoot.findByIdAndUpdate(modelBoot._id,{$pull: {keyWords: keyWordId}});
        }

        return res.status(200).send({
            penuriousKeyWord,
            categoriesWithKeyWord,
            modelBootsWithKeyWord
        });
    }catch(err){
        console.log(err);
        return messageError(res,500,'Server Error')
    }
    
}

async function saveKeyWordOnModelBoot(req,res){
    try{
        let keyWordId = req.params.keyWordId;
        let modelBootId = req.params.modelBootId;
        let modelBoot = await ModelBoot.findByIdAndUpdate(modelBootId,{$addToSet:{keyWords:keyWordId}},{new: true});

        return res.status(200).send({
            modelBoot
        });
    }catch(err){
        console.log(err);
        return messageError(res,500,'Server Error')
    }
    
}
async function deleteKeyWordOnModelBoot(req,res){
    try{
        let keyWordId = req.params.keyWordId;
        let modelBootId = req.params.modelBootId;
        let modelBoot = await ModelBoot.findByIdAndUpdate(modelBootId,{$pull:{keyWords:keyWordId}},{new: true});

        return res.status(200).send({
            modelBoot
        });
    }catch(err){
        console.log(err);
        return messageError(res,500,'Server Error')
    }
    
}

module.exports = {
    createKeyWord,
    searchKeyWord,
    deleteKeyWord,
    saveKeyWordOnModelBoot,
    deleteKeyWordOnModelBoot
}

const {messageError} = require('../services/constService');
var KeyWordCategory = require('../models/keyWordCategory');
var KeyWord = require('../models/keyWord');

async function createCategory(req,res){
    try{
        let categoryName = req.body.name;
        let categoryToSave = new KeyWordCategory();
        categoryToSave.name = categoryName;
        let category = await categoryToSave.save();
        return res.status(200).send({
            category
        });
    }catch(err){
        console.log(err);
        return messageError(res,300,'There was an error');
    }
}

async function saveKeyWordOnCategory(req,res){
    try{
        let categoryId = req.params.categoryId;
        let keyWordId = req.params.keyWordId;
        let categoryUpdated = await KeyWordCategory.findByIdAndUpdate(categoryId,{$addToSet: {keyWords:keyWordId}}, {new: true});
        return res.status(200).send({
            categoryUpdated
        });
    }catch(err){
        console.log(err);
        return messageError(res,300,'There was an error');
    }
}
module.exports = {
    createCategory,
    saveKeyWordOnCategory
}

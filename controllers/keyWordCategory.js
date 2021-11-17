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
        let keyWordUpdated = await KeyWord.findByIdAndUpdate(keyWordId,{$addToSet: {categories:categoryId}}, {new: true});
        return res.status(200).send({
            categoryUpdated,
            keyWordUpdated
        });
    }catch(err){
        console.log(err);
        return messageError(res,300,'There was an error');
    }
}
async function deleteKeyWordOnCategory(req,res){
    try{
        let categoryId = req.params.categoryId;
        let keyWordId = req.params.keyWordId;
        let categoryUpdated = await KeyWordCategory.findByIdAndUpdate(categoryId,{$pull: {keyWords:keyWordId}}, {new: true});
        let keyWordUpdated = await KeyWord.findByIdAndUpdate(keyWordId,{$pull: {categories:categoryId}}, {new: true});
        return res.status(200).send({
            categoryUpdated,
            keyWordUpdated
        });
    }catch(err){
        console.log(err);
        return messageError(res,300,'There was an error');
    }
}
async function deleteCategory(req,res){
    try{
        let categoryId = req.params.categoryId;
        let categoryDeleted = await KeyWordCategory.findByIdAndDelete(categoryId);
        return res.status(200).send({
            categoryDeleted
        });
    }catch(err){
        console.log(err);
        return messageError(res,300,'There was an error');
    }
}

async function getCategories(req,res){
    try{        
        let itemsPerPage = 4;
        let page = 1;
        if(req.params.page){
            page = req.params.page;
        };
        let categories = await KeyWordCategory.find().paginate(page, itemsPerPage);
        let total = await KeyWordCategory.count();
    return res.status(200).send({
        categories,
        page,
        total,
        pages: Math.ceil(total / itemsPerPage)
    });
    }catch(err){
        return messageError(res,500,'Server Error')        
    }
}

async function getCategory(req,res){
    try{
        let categoryId = req.params.categoryId;
        let category = await KeyWordCategory.findById(categoryId).populate('keyWords');
        return res.status(200).send({
            category
        });
    }catch(err){
        return messageError(res,300,'Server error');
    }
}

module.exports = {
    createCategory,
    saveKeyWordOnCategory,
    deleteKeyWordOnCategory,
    deleteCategory,
    getCategories,
    getCategory
}

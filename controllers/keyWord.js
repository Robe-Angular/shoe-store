var KeyWordCategory = require('../models/keyWordCategory');
var KeyWord = require('../models/keyWord');
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

module.exports = {
    createKeyWord,
    searchKeyWord
}

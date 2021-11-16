var KeyWordCategory = require('../models/keyWordCategory');
var KeyWord = require('../models/keyWord');
const { messageError } = require('../services/constService');

async function createKeyWord(req,res){
    try{

        let keyWordString = req.body.string;
        let keyWordToSave = new KeyWord();
        keyWordToSave.string = keyWordString;
        let keyWord = keyWordToSave.save();
        return res.status(200).send({
            keyWord
        });

    }catch(err){
        return messageError(res,300,'There was an error')
    }
}

module.exports = {
    createKeyWord    
}

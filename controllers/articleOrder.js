const {messageError} = require('../services/constService');
var ArticleOrder = require('../models/ArticleOrder');
var FullOrder = require('../models/FullOrder');

async function getArticleOrdersByParams(fullOrderFields,articleOrderFields,req){
    
    try{
        let mainOrders = [];
        let page = 1;
        let itemsPerPage = 10;
        if(req.params.page){
            page = req.params.page
        }
        
        
        let fullOrderArray = await FullOrder.find(fullOrderFields).select('_id');

        console.log(fullOrderArray);
        let objectsWithFullOrderKey = []
        for(let idFullOrder of fullOrderArray){
            let withFullOrderKey = {
                fullOrder: idFullOrder._id
            };
            objectsWithFullOrderKey.push(withFullOrderKey);
        }
        console.log(articleOrderFields);
        Object.assign(articleOrderFields,{$or: objectsWithFullOrderKey});

        let articlesArray = await ArticleOrder.find({articleOrderFields})
            .populate('user','name')
            .populate('modelBoot','title description')
            .populate('fullOrder');
        
        console.log(objectsWithFullOrderKey);

        console.log(articlesArray);

        
        let total = await FullOrder.count(fullOrderFields);
        console.log(total);
        /*
        for(let elementFullOrder of fullOrderArray){
            let articlesOrderInFullOrder = {
                fullOrder: elementFullOrder,
                articleArray:[]
            }
            Object.assign(articleOrderfields,{fullOrder: elementFullOrder._id});
            let articlesOfFullOrder = await ArticleOrder.find(articleOrderfields).populate('size','size -_id').populate('modelBoot','title description -_id');
            articlesOrderInFullOrder.articleArray = articlesOfFullOrder;
            mainOrders.push(articlesOrderInFullOrder);
        }
        */
        let responseObject = {
            articles: mainOrders,
            page,
            total,
            pages: Math.ceil(total / itemsPerPage)
        }
        return responseObject;
    }catch(err){
        console.log(err);
    }
}

async function getArticleOrdersModelsUsers(req,res){
    try{
        let fullOrderFields = {}
        let articleOrderFields = {}
        if(req.params.modelBoot){
            let fieldModel = req.params.modelBoot;
            Object.assign(articleOrderFields,{modelBoot: fieldModel})
        }
        if(req.params.userId){
            let fieldUser = req.params.userId;    
            Object.assign(fullOrderFields,{user: fieldUser})
        }
        if(req.params.sended){
            let fieldSended = false;
            if(req.params.sended == "sended"){
                fieldSended = true;
            }
            Object.assign(fullOrderFields,{sended: fieldsended})
        }
        if(req.params.received){
            let fieldReceived = false;
            if(req.params.received == "received"){
                fieldReceived = true;
            }
            Object.assign(fullOrderFields,{received: fieldReceived})
        }
        
        let articles = await getArticleOrdersByParams(fullOrderFields,articleOrderFields,req);
        return res.status(200).send({articles});
    }catch(err){
        console.log(err);
    }

}

async function setSended(req,res){
    try{
        let fullOrderId = req.params.fullOrderId
        let sended = false;
        if (req.params.sended == 'sended'){
            sended = true
        }
        let updatedFullOrder = await FullOrder.findByIdAndUpdate(fullOrderId,{sended:sended},{new:true});
        return res.status(200).send({updatedFullOrder});
    }catch(err){
        console.log(err);
    }
}

async function setReceived(req,res){
    let received = false;
    let fullOrderId = req.params.fullOrderId
    let userId = req.user.sub;
    if (req.params.received == 'received'){
        received = true
    }
    let updatedFullOrder = await FullOrder.findOneAndUpdate({user:userId, _id:fullOrderId},{received:received},{new:true});
    return res.status(200).send({updatedFullOrder});

}

module.exports = {
    getArticleOrdersModelsUsers,
    setSended,
    setReceived
}
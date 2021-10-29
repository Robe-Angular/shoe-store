const {messageError} = require('../services/constService');
var ArticleOrder = require('../models/ArticleOrder');
var FullOrder = require('../models/FullOrder');

async function getArticleOrdersByParams(fields,req){
    
    try{
        let mainOrders = [];
        let page = 1;
        let itemsPerPage = 10;
        if(req.params.page){
            page = req.params.page
        }
        let fullOrderArray = await FullOrder.find(fields).paginate(page,itemsPerPage);
        let total = await FullOrder.count();
        for(let elementFullOrder of fullOrderArray){
            let articlesOrderInFullOrder = {
                fullOrder: elementFullOrder,
                articleArray:[]
            }
            let articlesOfFullOrder = await ArticleOrder.find({fullOrder: elementFullOrder._id});
            articlesOrderInFullOrder.articleArray = articlesOfFullOrder;
            mainOrders.push(articlesOrderInFullOrder);
        }
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
        let fields = {}
        if(req.params.userId){
            let fieldUser = req.params.userId;    
            Object.assign(fields,{user: fieldUser})
        }
        
        
        if(req.params.model){
            let fieldModel = req.params.modelBoot;
            Object.assign(fields,{model: fieldModel})
        }

        if(req.params.sended){
            let fieldSended = false;
            if(req.params.sended == "sended"){
                fieldSended = true;
            }
            Object.assign(fields,{sended: fieldsended})
        }
        if(req.params.received){
            let fieldReceived = false;
            if(req.params.received == "received"){
                fieldReceived = true;
            }
            Object.assign(fields,{received: fieldReceived})
        }
        
        let articles = await getArticleOrdersByParams(fields,req);
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
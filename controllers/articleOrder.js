const {messageError} = require('../services/constService');
var ArticleOrder = require('../models/ArticleOrder');
var FullOrder = require('../models/FullOrder');

async function getFullOrder(req,res){
    try{
        let fullOrderId = req.params.fullOrderId;
        let userId = req.user.sub;
        let userRole = req.user.role;
        let fullOrder = {};
        let articlesOrder = [];
        if(userRole == 'ROLE_ADMIN'){
            fullOrder = await FullOrder.findById(fullOrderId)
            articlesOrder = await ArticleOrder.find({fullOrder:fullOrderId})
            .populate('modelBoot','title description')
            .populate('size', 'size');
        }else{
            fullOrder = await FullOrder.findOne({$and:[{_id:fullOrderId},{user:userId}]})
            articlesOrder = await ArticleOrder.find({$and:[{fullOrder:fullOrderId},{user:userId}]})
            .populate('modelBoot','title description')
            .populate('size', 'size');
        }
        
        return res.status(200).send({
            fullOrder,
            articlesOrder
        });
    }catch(err){
        console.log(err);
        return messageError(res,500,'Server error');

    }
}

async function getArticleOrdersByParams(articleOrderFields,req){
    
    try{        
        let page = 1;
        let itemsPerPage = 10;
        let params = req.params;
        
        if(params.page){
            page = params.page;
        }        
        
        let articlesArray = await ArticleOrder.find({$and:[articleOrderFields]})
            .populate('user','name')
            .populate('modelBoot','title description')
            .populate('fullOrder')
            .paginate(page,itemsPerPage);
        
        let total = await ArticleOrder.count(articleOrderFields);
        let responseObject = {
            articles: articlesArray,
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
            Object.assign(fullOrderFields,{user: fieldUser});
            Object.assign(articleOrderFields,{user: fieldUser});
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
        
        let articles = await getArticleOrdersByParams(articleOrderFields,req);
        return res.status(200).send({articles});
    }catch(err){
        console.log(err);
    }

}
async function getOrdersByParams(req,res){
    try{
        let fullOrderFields = {}
        if(req.params.userId){
            let fieldUser = req.params.userId;    
            Object.assign(fullOrderFields,{user: fieldUser});
        }
        if(req.params.sended){
            let fieldSended = false;
            if(req.params.sended == "sended"){
                fieldSended = true;
            }
            Object.assign(fullOrderFields,{sended: fieldSended})
        }
        if(req.params.received){
            let fieldReceived = false;
            if(req.params.received == "received"){
                fieldReceived = true;
            }
            Object.assign(fullOrderFields,{received: fieldReceived})
        }
        let page = 1;

        let itemsPerPage = 10;
        let params = req.params;
        
        if(params.page){
            page = params.page;
        }
        let ordersMatch = await FullOrder.find({$and:[fullOrderFields]}).paginate(page,itemsPerPage)
            .populate('user','nick name email');
        let total = await FullOrder.count({$and:[fullOrderFields]});
        let responseObject = [];
        for (let orderMatch of ordersMatch){
            let responseObjectElement = {
                fullOrder:orderMatch,
                articles:[]
            }
            let articlesOfFullOrder = await ArticleOrder.find({fullOrder: orderMatch._id})
            .populate('modelBoot','title description');
            responseObjectElement.articles = articlesOfFullOrder;
            responseObject.push(responseObjectElement);
        }
        return res.status(200).send({
            responseObject,
            page,
            total,
            pages: Math.ceil(total / itemsPerPage)
        });
        
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
    getFullOrder,
    getArticleOrdersModelsUsers,
    getOrdersByParams,
    setSended,
    setReceived
}
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
        let total = await FullShoppingCart.count();
        for(let elementFullOrder of fullOrderArray){
            let articlesOrderInFullOrder = {
                fullOrder: elementFullOrder,
                articleArray:[]
            }
            let articlesOfFullOrder = await ArticleOrder.find({fullOrder: elementFullOrder._id});
            articlesOrderInFullOrder.articleArray = articlesOfFullOrder;
            mainOrders.articleArray.push(articlesOrderInFullOrder);
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
        
        
        if(req.params.user){
            let fieldModel = req.params.modelBoot;
            Object.assign(fields,{user: fieldModel})
        }
        
        let articles = await getArticleOrdersByParams(fields,req);
    }catch(err){
        console.log(err);
    }

}

module.exports = {
    getArticleOrdersModelsUsers
}
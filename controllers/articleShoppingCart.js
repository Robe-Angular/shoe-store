var ArticleShoppingCart = require('../models/articleShoppingCart');
var FullShoppingCart = require('../models/fullShoppingCart');
var SizeBoot = require('../models/sizeBoot');
var ArticleOrder = require('../models/articleOrder');
var FullOrder = require('../models/fullOrder');
var Address = require('../models/address');
const {messageError} = require('../services/constService');
const {iterateOverBodyValidSizes} = require('../services/modelBootService');
const {createPaypalOrder,capturePaypalOrder} = require('../services/paypalService');
const {setTotalPriceAndUpdate, setSizesPacket} = require('../services/articleShoppingCartService');
const skydropxService = require('../services/skydropxService');


async function getSkydropAvailableServices(fullShoppingCart){
    try{
        let sizesObject = {
            height : fullShoppingCart.height,
            weight : fullShoppingCart.weight,
            length : fullShoppingCart.length,
            width : fullShoppingCart.width
        }        
        let skydropxAvailableServices = await skydropxService.requestSkydropPrice(sizesObject, fullShoppingCart.address.get('postalCode'));
        return skydropxAvailableServices
    }catch(err){
        console.log(err)
    }
}

async function updateFullCart_SkydropRequest(fullCartId){
    try{
        let setPrice = await setTotalPriceAndUpdate(fullCartId);
        let updatedSizesPacket = await setSizesPacket(fullCartId);        
        let articlesArray = setPrice.itemsOnFullCart;

        if(updatedSizesPacket.updatedFullCart.address == null){            
            return 'No address known';
        }else{
            let postalCode = updatedSizesPacket.updatedFullCart.address.get('postalCode');
            let skydropxServicesAvailable = await skydropxService.requestSkydropPrice(updatedSizesPacket.packetSizes, postalCode);             
            return {
                articlesArray,
                updatedSizesPacket,
                skydropxServicesAvailable
            }
        }        
    }catch(err){
        console.log(err);
        return messageError(res,500,'Server error')
    }
    
}



async function saveOnCart(req,res){
    try{
        let modelId = req.params.modelId;
        let body = req.body;
        let articleShoppingCartArray = [];
        let userId = req.user.sub;

        let deleteItemsUserModel = await ArticleShoppingCart.deleteMany({modelBoot: modelId,user:userId });

        let fullCartId = '';
        let sizes = await SizeBoot.find({modelBoot:modelId});
        if(sizes.filter(obj => {
            return (!obj.height || obj.height <= 0 || obj.height == undefined
                     || !obj.weight || obj.weight <= 0 || obj.weight == undefined
                    || !obj.length || obj.length <= 0 || !obj.length == undefined
                     || !obj.width || obj.width <= 0 || !obj.width == undefined)
        }).length > 0){
            return messageError(res, 300, 'invalid Size')
        }

        await iterateOverBodyValidSizes(modelId,body, async (sizeElementDb,keyElement) => {
            
            let bodyValue = parseInt(body[keyElement]);
            let sizeId = sizeElementDb._id;
            let sizeQuantityDb = parseInt(sizeElementDb.quantity);
            let quantity = (bodyValue <= sizeQuantityDb) ? bodyValue : sizeQuantityDb;
            if(bodyValue < 0) {
                quantity = 0;
            }
            if(quantity > 0){

            let articleCart = new ArticleShoppingCart();
            articleCart.modelBoot = modelId;
            articleCart.user = userId;
            articleCart.size = sizeId;
            articleCart.quantity = quantity;
            let fullCartExists = await FullShoppingCart.find({user:userId});

            if(fullCartExists.length > 0){
                fullCartId = fullCartExists[0]._id;
                

            }else{                
                
                let fullShoppingCart = new FullShoppingCart();
                fullShoppingCart.user = userId;
                let newFullCart = await fullShoppingCart.save();
                fullCartId = newFullCart._id;
                
            }

            articleCart.fullShoppingCart = fullCartId;
            let saveArticleOnCart = await articleCart.save();            
            articleShoppingCartArray.push(saveArticleOnCart);
            }

           
        });              
        if(!articleShoppingCartArray.length > 0){
            return messageError(res,300,'No elements matched');
        }
         
        let skydropxRequest = await updateFullCart_SkydropRequest(fullCartId)
        return res.status(200).send({
            skydropxRequest
        });
    }catch(err){
        console.log(err);
        return messageError(res,300,'Server Error');
    }
}

async function getArticlesShoppingCart(req,res){
    try{
        
        let page = 1;
        let itemsPerPage = 4;
        if(req.params.page){
            page = req.params.page
        }

        let fullCartArray = await FullShoppingCart.find().paginate(page,itemsPerPage);
        let total = await FullShoppingCart.count();
        let articlesMainArray = [];
        for(let fullCartElement of fullCartArray){
            let articlesOnFullCart = {
                fullCart: fullCartElement,
                articles: []
            }
            let fullCartId = fullCartElement._id;
            let articlesElementArray = await ArticleShoppingCart.find({fullShoppingCart: fullCartId});
            articlesOnFullCart.articles = articlesElementArray;
            articlesMainArray.push(articlesOnFullCart);
        }
        return res.status(200).send({
            fullCartArray,
            articlesMainArray,
            page,
            total,
            pages: Math.ceil(total / itemsPerPage)
        });
    }catch(err){
        console.log(err);
        return messageError(res,500,'Server Error');
    }
}

async function getArticleShoppingCart(req,res){
    try{
        let userId = req.params.userId
        let fullCart = await FullShoppingCart.findOne({user:userId});       
        let fullCartId = fullCart._id;
        let articlesArray = await ArticleShoppingCart.find({fullShoppingCart: fullCartId});
        return res.status(200).send({
            fullCart,
            articlesArray
        });
    }catch(err){
        console.log(err);
        return messageError(res,500,'Server Error');
    }
}

async function removeFullCartUser(req,res){
    try{
        let userId = req.user.sub;
        let deletedFullCart = await FullShoppingCart.deleteMany({user:userId});
        let deletedItemsCart = await ArticleShoppingCart.deleteMany({user:userId});
        return res.status(200).send({
            deletedFullCart,
            deletedItemsCart
        });
    }catch(err){
        return messageError(res,500,'Server error');
    }
}

async function removeFullCartAdmin(req,res){
    try{
        let fullShoppingCartId = req.params.fullShoppingCartId;
        let deletedFullCart = await FullShoppingCart.findByIdAndDelete(fullShoppingCartId);
        let deletedItemsCart = await ArticleShoppingCart.deleteMany({fullShoppingCart:fullShoppingCartId});
        return res.status(200).send({
            deletedFullCart,
            deletedItemsCart
        });
    }catch(err){
        return messageError(res,500,'Server error');
    }
}

async function removeItem(req,res){
    try{
        let userId = req.user.sub;
        let modelId = req.params.modelId;
        let deletedItems = await ArticleShoppingCart.deleteMany({user: userId, modelBoot:modelId});
        let fullCart = await FullShoppingCart.findOne({user: userId});
        let fullCartId = fullCart._id;

        let skydropxRequest = await updateFullCart_SkydropRequest(fullCartId)
        return res.status(200).send({
            skydropxRequest
        });
    }catch(err){
        return messageError(res,500,'Server error');
    }
}

async function saveAddressOnFullCart(req,res){
    let userId = req.user.sub;
    let addressId = req.params.addressId;
    
    let address = await Address.findById(addressId);
    if(address.user != userId ) return messageError(res,300,'No credentials');
    let addressUpdate = {
        completeName: address.completeName,
        telephone: address.telephone,
        street: address.street,
        locality_2: address.locality_2,//Neighborhood, Quarter or Settlement
        province_2: address.province_2,//Municipality
        postalCode: address.postalCode,
        locality_1: address.locality_1,//City
        houseNumber: address.houseNumber,
        province_1: address.province_1//State
    }

    let fullCartToUpdate = await FullShoppingCart.findOneAndUpdate({user : userId},{address: addressUpdate},{new:true});
    return res.status(200).send({
        fullCartToUpdate
    });
}


async function paypalCreate(req,res){
    try{
        let userId = req.user.sub;
        let fullShoppingCart = await FullShoppingCart.findOne({user:userId});
        
        if(!fullShoppingCart) return messageError(res,300,'No Cart yet');
        let originalPrice = parseInt(fullShoppingCart.originalPrice);

        let reqParService = req.params.skyService;
        let reqParamsPrice = req.params.price;
        let reqParamsPriceInt = parseInt(reqParamsPrice);

        let skydropxAvailableServices = await getSkydropAvailableServices(fullShoppingCart);

        if(skydropxAvailableServices.filter(obj => {
            return obj.provider == reqParService && obj.total_pricing == reqParamsPrice
        }).length > 0){            
            let priceSum = originalPrice + reqParamsPriceInt; //Adding shippingPrice to articles price
            let createOrder = await createPaypalOrder(priceSum);
            let paypalId = createOrder.id;
            let updateFullShoppingCart = await FullShoppingCart.findByIdAndUpdate(fullShoppingCart.id,{paypalId:paypalId,priceShipping:reqParamsPrice});
            return res.status(200).send({createOrder});
        }else{
            return messageError(res,300,'No service Match');
        }        
        
    }catch(err){
        console.log(err)
        return messageError(res,500,'Server error');
    }
}

async function tryBuy(req,res){
    try{        
        let orderId = req.params.orderId;
        
        let userId = req.user.sub;
        let fullShoppingCart = await FullShoppingCart.findOne({user:userId});
        if(!fullShoppingCart.address) return messageError(res,300,'Address must be inserted');
        if(!fullShoppingCart || fullShoppingCart.paypalId != orderId) return messageError(res,300,'Paypal ID doesn\'t match');
        let fullShoppingCartId = fullShoppingCart._id;

        let skydropxAvailableServices = await getSkydropAvailableServices(fullShoppingCart);


        let articleShoppingCartArray = await ArticleShoppingCart.find({fullShoppingCart: fullShoppingCartId});

        let insufficient = false;
        for(let elementArticle of articleShoppingCartArray){
            let elementArticleId = elementArticle._id;
            let elementArticleSize = elementArticle.size;
            let elementArticleQuantity = parseInt(elementArticle.quantity);
            let sizeOnDB = await SizeBoot.findById(elementArticleSize);
            let sizeStock = parseInt(sizeOnDB.quantity);
            if(elementArticleQuantity > sizeStock){
                insufficient = true;                
                elementArticle.quantity = sizeStock;
                let updateElementArticle = await ArticleShoppingCart.findByIdAndUpdate(elementArticleId,elementArticle);
            }
        }
        if(insufficient || skydropxAvailableServices.filter( obj => {
            return obj.total_pricing == fullShoppingCart.priceShipping;
        }) == 0){
            let updateFullCartPaypal = await FullShoppingCart.findByIdAndUpdate(fullShoppingCartId,{paypalId:''});

            let skydropxRequest = await updateFullCart_SkydropRequest(fullCartId);
        
            return res.status(300).send({
                skydropxRequest,
                message:'Insufficient on stock or no price match'
            })
        }else{
            let captured = await capturePaypalOrder(orderId);
            if(captured.status != 'COMPLETED') return messageError(res,300,'Order not Approved');
            let fullOrder = new FullOrder();
            fullOrder.price = fullShoppingCart.originalPrice;
            fullOrder.priceShipping = fullShoppingCart.priceShipping;
            fullOrder.user = userId;
            fullOrder.address = fullShoppingCart.address;
            let createdFullOrder = await fullOrder.save();
            let articleOrderStored = [];

            for(let elementArticle of articleShoppingCartArray){
                let articleOrder = new ArticleOrder();
                articleOrder.user = userId;
                articleOrder.fullOrder = createdFullOrder._id;
                articleOrder.modelBoot = elementArticle.modelBoot;
                articleOrder.size = elementArticle.size;
                let quantityInt = parseInt(elementArticle.quantity);
                if(quantityInt > 0){
                    articleOrder.quantity = elementArticle.quantity;                
                    let createdArticleOrder =await articleOrder.save();
                    articleOrderStored.push(createdArticleOrder);
                    
                    let sizeToUpdate = await SizeBoot.findById(articleOrder.size);
                    let newQuantity = parseInt(sizeToUpdate.quantity) - articleOrder.quantity;
                    let updatedSize = await SizeBoot.findByIdAndUpdate(elementArticle.size,{quantity: newQuantity});
                }
                
            }
            let deletedFullCart = await FullShoppingCart.deleteMany({user:userId});
            let deletedItemsCart = await ArticleShoppingCart.deleteMany({user:userId});
            
            return res.status(200).send({articleOrderStored,createdFullOrder});
            
        }
    }catch(err){
        console.log(err)
    }
}


module.exports = {
    saveOnCart,
    getArticlesShoppingCart,
    getArticleShoppingCart,
    removeFullCartAdmin,
    removeFullCartUser,
    removeItem,
    saveAddressOnFullCart,
    paypalCreate,
    tryBuy
}


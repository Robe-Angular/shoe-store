var ArticleShoppingCart = require('../models/articleShoppingCart');
var FullShoppingCart = require('../models/fullShoppingCart');
var SizeBoot = require('../models/sizeBoot');
var ArticleOrder = require('../models/articleOrder');
var FullOrder = require('../models/fullOrder');
var Address = require('../models/address');
const {messageError} = require('../services/constService');
const {iterateOverBodyValidSizes} = require('../services/modelBootService');
const {createPaypalOrder,capturePaypalOrder} = require('../services/paypalService');
const {setTotalPricesAndUpdate} = require('../services/articleShoppingCartService');

const limitHeight = process.env.LIMIT_HEIGHT;
const limitWidth = process.env.LIMIT_WIDTH;
const limitLength = process.env.LIMIT_LENGTH;
const limitVolume = process.env.LIMIT_VOLUME;

async function saveOnCart(req,res){
    try{
        let modelId = req.params.modelId;
        let body = req.body;
        let articleShoppingCartArray = [];
        let userId = req.user.sub;

        let deleteItemsUserModel = await ArticleShoppingCart.deleteMany({modelBoot: modelId,user:userId });

        let fullCartId = '';
        await iterateOverBodyValidSizes(modelId,body, async (sizeElement,keyElement) => {
            let bodyValue = parseInt(body[keyElement]);
            let sizeId = sizeElement._id;
            let sizeQuantity = parseInt(sizeElement.quantity);
            let quantity = (bodyValue <= sizeQuantity) ? bodyValue : sizeQuantity;
            if(bodyValue < 0) {
                quantity = 0;
            }

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
            //Checking Order Size
            let articlesOnFullShoppingCart = ArticleShoppingCart.find({fullShoppingCart:fullCartId})
                .populate('size','height width length');
            let currentHeight = 0;
            let currentWidth = 0;

            let reseteableWidth = 0;
            let greatherWidth = 0;
            let currentLength = 0;

            let reseteableHeight = 0;
            let widthCol = 0;
            let reseteableLength = 0;
            
            for(article of articlesOnFullShoppingCart){
                let currentItems = article.quantity;

                while(currentItems > 0){
                    let itemsFitHeight = floor((limitHeight - reseteableHeight) / article.size.height);                    

                    let articleItemsFit = currentItems > itemsFitHeight ? itemsFitHeight : currentItems;

                    currentItems = currentItems - articleItemsFit;

                    if(itemsFitHeight < 1){
                        currentHeight = currentHeight > reseteableHeight ? currentHeight : reseteableHeight;
                        reseteableHeight = 0;                               
                        let widthPreMeasurement = reseteableWidth + widthCol;
                        
                        if(widthPreMeasurement < limitWidth){
                            reseteableWidth = widthPreMeasurement;
                        }else{
                            currentWidth = currentWidth > reseteableWidth ? currentWidth : reseteableWidth;
                            reseteableWidth = 0;                            
                            currentLength += lengthRow;
                        }
                        
                    }else{
                        reseteableHeight += article.size.height * itemsFitHeight;
                        widthCol = widthCol > article.size.width ? widthCol : article.size.width;
                        lengthRow = lengthRow > article.size.length ? lengthRow : article.size.length;

                    }
                }
                let volume = (currentHeight * currentWidth * currentLength)/5000;
                console.log(currentHeight,currentWidth,currentLength,volume);

            }
        });              
        

        
        let functionUpdate = await setTotalPricesAndUpdate(fullCartId);
        let updatedFullCart = functionUpdate.updatedFullCart;
        let itemsOnFullCart = functionUpdate.itemsOnFullCart;
        return res.status(200).send({
            articleShoppingCartArray,
            updatedFullCart,
            itemsOnFullCart
            
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
        let functionUpdate = await setTotalPricesAndUpdate(fullCartId);
        let updatedFullCart = functionUpdate.updatedFullCart;
        let itemsOnFullCart = functionUpdate.itemsOnFullCart;

        return res.status(200).send({
            deletedItems,
            updatedFullCart,
            itemsOnFullCart
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
        let fullShoppingCartPrice = fullShoppingCart.priceDiscount;
        
        let createOrder = await createPaypalOrder(fullShoppingCartPrice);
        let paypalId = createOrder.id;
        let updateFullShoppingCart = await FullShoppingCart.findByIdAndUpdate(fullShoppingCart.id,{paypalId:paypalId});
        return res.status(200).send({createOrder});
    }catch(err){
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
        if(insufficient){
            let updateFullCartPaypal = await FullShoppingCart.findByIdAndUpdate(fullShoppingCartId,{paypalId:''});
            let updateFullCartPrice = await setTotalPricesAndUpdate(fullShoppingCartId);
            let updatedFullCart = updateFullCartPrice.updatedFullCart;
            let itemsOnFullCart = updateFullCartPrice.itemsOnFullCart;
            return res.status(300).send({
                updatedFullCart,
                itemsOnFullCart,
                message:'Insufficient on stock'
            })
        }else{
            let captured = await capturePaypalOrder(orderId);
            console.log(captured);
            if(captured.status != 'COMPLETED') return messageError(res,300,'Order not Approved');
            let fullOrder = new FullOrder();
            fullOrder.price = fullShoppingCart.priceDiscount;
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


var Discount = require('../models/discount');
var ArticleShoppingCart = require('../models/articleShoppingCart');
var FullShoppingCart = require('../models/fullShoppingCart');
const {iterateOverModelsOnFullCart} = require('../services/modelBootService');
const {Mayo} = require('../services/discountService');
const limitHeight = process.env.LIMIT_HEIGHT;
const limitWidth = process.env.LIMIT_WIDTH;
const limitLength = process.env.LIMIT_LENGTH;
const limitVolume = process.env.LIMIT_VOLUME;

class Column{    
    constructor(height,width, length){
        this.height = height;
        this.width = width;
        this.length = length;
    }

    getWidth(){
        return this.width;
    }

    getLength(){
        return this.length;
    }

    getHeight(){
        return this.height;
    }
}

const service ={
    setTotalPrice : async (fullShoppingCartId) => {
        try{
            let totalPrice = 0;
            
            await iterateOverModelsOnFullCart(fullShoppingCartId,(quantity,price) => {
                totalPrice += quantity * price;
                
            });            
            return totalPrice;        
        }catch(err){
            console.log(err);
        }
    },

    updateFullCart: async (price,fullCartId) => {
        try{
            
            let updateFullCart = {
                originalPrice: price,
                originalPriceDiscount: price,//The same                
                paypalId:''
            }
            let updatedFullCart = await FullShoppingCart.findByIdAndUpdate(fullCartId,updateFullCart,{new:true});
            let itemsOnFullCart = await ArticleShoppingCart.find({fullShoppingCart:fullCartId})
            .populate('modelBoot','title description')
            .populate('size','size');
            return {updatedFullCart,itemsOnFullCart}
    
        }catch(err){
            console.log(err);
        }
    },
    setTotalPriceAndUpdate: async(fullCartId) => {        

        let price = await service.setTotalPrice(fullCartId);
        let updateFullCartPrice = await service.updateFullCart(price,fullCartId);
        let updatedFullCart = updateFullCartPrice.updatedFullCart;
        let itemsOnFullCart = updateFullCartPrice.itemsOnFullCart;
        return {updatedFullCart,itemsOnFullCart}
    },

    setSizesPacket: async(fullCartId) => {
        let articlesOnFullShoppingCart = await ArticleShoppingCart.find({
            $and:[
                {fullShoppingCart:fullCartId},
                {quantity:{$gt:0}}
            ]})
            .populate('size','weight height width length');
        
        let volume = 0;
        let currentHeight = 0;
        let currentWidth = 0;

        let reseteableWidth = 0;
        let greatherWidth = 0;
        let currentLength = 0;

        let reseteableHeight = 0;
        let widthCol = 0;
        let lengthCol = 0;

        let reseteableLength = 0;
        let columns = []
        let arrayCounter = 0;
        let totalWeight = 0;
        //Columns
        for(let article of articlesOnFullShoppingCart){

            totalWeight += article.quantity * article.size.weight;

            let currentItems = parseInt(article.quantity);
            arrayCounter++;
            while(currentItems > 0){
                
                let itemsFitHeight = Math.floor((limitHeight - reseteableHeight) / parseInt(article.size.height));                    
                let articleItemsFit = currentItems > itemsFitHeight ? itemsFitHeight : currentItems;
                currentItems = currentItems - articleItemsFit;
                
                if(itemsFitHeight < 1){
                    let column =new Column(reseteableHeight,widthCol,lengthCol);
                    widthCol = 0;
                    lengthCol = 0;
                    columns.push(column);
                    reseteableHeight = 0;
                }else{
                    reseteableHeight += article.size.height * articleItemsFit;
                    widthCol = widthCol > parseInt(article.size.width) ? widthCol : parseInt(article.size.width);
                    lengthCol = lengthCol > parseInt(article.size.length) ? lengthCol : parseInt(article.size.length);

                    if(arrayCounter == articlesOnFullShoppingCart.length && currentItems == 0 ){
                        
                        let column =new Column(reseteableHeight,widthCol,lengthCol);
                        columns.push(column);
                    }
                    
                }

            }
        }
        let count = 0;
        let lengthRow = 0;
        
        for(let column of columns){
            let columnHeight = column.getHeight();
            let columnWidth = column.getWidth();
            let columnLength = column.getLength();

            lengthRow = count == 0 ? columnLength : lengthRow;
            
            count++;
            

            currentHeight = currentHeight > columnHeight ? currentHeight : columnHeight;            
            let widthPremeasurement = reseteableWidth + columnWidth;

            if(widthPremeasurement >= limitWidth){
                currentWidth = currentWidth > reseteableWidth ? currentWidth : reseteableWidth;
                currentLength += lengthRow;
                lengthRow = columnLength;
                
                reseteableWidth = columnWidth;
            }else{
                lengthRow = lengthRow > columnLength ? lengthRow:columnLength;
                reseteableWidth = widthPremeasurement;
            }

            if(count == columns.length){
                currentWidth = currentWidth == 0 ? reseteableWidth : currentWidth ;
                currentLength += lengthRow;
            }                     
        }

        volume = (currentHeight * currentWidth * currentLength)/5000;
        let packetSizes = {
            height: currentHeight,
            width: currentWidth,
            length:currentLength,
            weight:totalWeight
        }
        let updatedFullCart = await FullShoppingCart.findByIdAndUpdate(fullCartId,packetSizes, {new:true});
        return {
            updatedFullCart,
            packetSizes
        }
            
        
    }
    
}
module.exports = service;
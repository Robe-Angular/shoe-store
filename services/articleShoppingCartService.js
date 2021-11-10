var Discount = require('../models/discount');
var ArticleShoppingCart = require('../models/articleShoppingCart');
var FullShoppingCart = require('../models/fullShoppingCart');
const {iterateOverModelsOnFullCart} = require('../services/modelBootService');
const {Mayo} = require('../services/discountService');

const service ={
    setTotalPrices : async (fullShoppingCartId) => {
        try{
            let totalPrice = 0;
            
            await iterateOverModelsOnFullCart(fullShoppingCartId,(quantity,price) => {
                totalPrice += quantity * price;
            });
            let totalPriceWithDiscount = totalPrice;
            /*
            *for 'Mayo' its:
            *let ->Mayo<-DiscountFinded = await Discount.findOne({title:'->Mayo<-'});
            *let ->Mayo<-DiscountValue = await ->Mayo<-(fullShoppingCartId); // Discount Service
            *totalPriceWithDiscount = (->Mayo<-DiscountFinded.applied) ? ->Mayo<-DiscountValue:totalPrice;
            */
            let MayoDiscountFinded = await Discount.findOne({title:'Mayo'});
            let MayoDiscountValue = await Mayo(fullShoppingCartId);
            totalPriceWithDiscount = (MayoDiscountFinded.applied) ? MayoDiscountValue:totalPrice;
            return {totalPrice,totalPriceWithDiscount};        
        }catch(err){
            console.log(err);
        }
    },
    updateFullCart: async (prices,fullCartId) => {
        try{
            let updateFullCart = {
                originalPrice: prices.totalPrice,
                priceDiscount: prices.totalPriceWithDiscount,
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
    setTotalPricesAndUpdate: async(fullCartId) => {
        let prices = await service.setTotalPrices(fullCartId);
        let updateFullCartPrices = await service.updateFullCart(prices,fullCartId);
        let updatedFullCart = updateFullCartPrices.updatedFullCart;
        let itemsOnFullCart = updateFullCartPrices.itemsOnFullCart;
        return {updatedFullCart,itemsOnFullCart}
    }
}
module.exports = service;
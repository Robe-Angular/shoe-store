const {iterateOverModelsOnFullCart} = require('../services/modelBootService');


const service ={
    Mayo : async (fullShoppingCartId) => {      
        try{
            let totalPriceWithDiscount = 0;
            await iterateOverModelsOnFullCart(fullShoppingCartId, async(quantity,price) => {
                totalPriceWithDiscount += (Math.floor(quantity/3)*2 + (quantity % 3)) * price;
            });
            return totalPriceWithDiscount;
        }catch(err){
            console.log(err);
        }
    }
}
module.exports = service;

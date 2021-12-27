var axios = require('axios');
const hiddenUser = process.env.EMAIL_USER;
const zip_from = process.env.ZIP_FROM_SKYDROPX;

const service = {
    requestSkydropPrice: async (packetSizes, postalCode) => {
        try{
            let weight = packetSizes.weight;
            let height = packetSizes.height;
            let width = packetSizes.width;
            let length = packetSizes.length;
            await axios({
                method:'post',
                url: 'https://api.skydropx.com/v1/quotations',
                data:{
                    "zip_from": zip_from, 
                    "zip_to": postalCode, 
                    "parcel": { 
                        "weight": weight,
                        "height": height,
                        "width": width,
                        "length": length
                    } 
                },
                headers:{
                    "Authorization": "Token token=uu693zrhjGpDt0E6JVJomrreGqwwS0sJrwpHJTRdQfUt",
                    'Content-Type':'application/json'
                }
                
            }).then( response => {
                console.log(response.data);
                console.log(response.config.data);
            }).catch( err =>{
                console.log(err);
            });
        }catch(err){
            console.log(err);
        }

        
    }
    
}
module.exports = service;
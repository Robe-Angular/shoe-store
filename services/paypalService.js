const paypal = require('@paypal/checkout-server-sdk');
var dotenv = require('dotenv').config();  
// Creating an environment
const clientId = process.env.CLIENT_PAY;
const clientSecret = process.env.SECRET_PAY;
const currency = 'MXN'
// This sample uses SandboxEnvironment. In production, use LiveEnvironment
let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
let client = new paypal.core.PayPalHttpClient(environment);

const service ={
    createPaypalOrder:(value) => {
        let valueFixed = value.toFixed(2);
        console.log(valueFixed);
        let request = new paypal.orders.OrdersCreateRequest();
        request.requestBody({
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "amount": {
                        "currency_code": currency,
                        "value": valueFixed
                    }
                }
            ]
        });
        console.log(request);
        // Call API with your client and get a response for your call
        let createOrder  = async function() {
            let response = await client.execute(request);
            console.log(`Response: ${JSON.stringify(response)}`);
            
            // If call returns body in response, you can get the deserialized version from the result attribute of the response.
            console.log(`Order: ${JSON.stringify(response.result)}`);
        }
        createOrder();
    }
};
module.exports = service;
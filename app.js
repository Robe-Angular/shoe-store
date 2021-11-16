'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//load routes
var user_routes = require('./routes/user');
var modelBoot_routes = require('./routes/modelBoot');
var discount_routes = require('./routes/discount');
var articleShoppingCart_routes = require('./routes/articleShoppingCart');
var articleOrder_routes = require('./routes/articleOrder');
var address_routes = require('./routes/address');
var keyWordCategory_routes = require('./routes/keyWordCategory');
var keyWord_routes = require('./routes/keyWord');


//middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//cors

//routes
app.use('/api', user_routes);
app.use('/api', modelBoot_routes);
app.use('/api', discount_routes);
app.use('/api', articleShoppingCart_routes);
app.use('/api', articleOrder_routes);
app.use('/api', address_routes);
app.use('/api', keyWordCategory_routes);
app.use('/api', keyWord_routes);


//export
module.exports = app;

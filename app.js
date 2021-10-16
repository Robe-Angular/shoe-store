'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//load routes
var user_routes = require('./routes/user');
var modelBoot_routes = require('./routes/modelBoot');
var discount_routes = require('./routes/discount');
var articleShoppingCart_routes = require('./routes/articleShoppingCart');

//middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//cors

//routes
app.use('/api', user_routes);
app.use('/api', modelBoot_routes);
app.use('/api', discount_routes);
app.use('/api', articleShoppingCart_routes);


//export
module.exports = app;
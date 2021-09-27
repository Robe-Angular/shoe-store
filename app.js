'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//load routes
var user_routes = require('./routes/user');
var modelBoot_routes = require('./routes/modelBoot');

//middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//cors

//routes
app.use('/api', user_routes);
app.use('/api', modelBoot_routes);

//export
module.exports = app;
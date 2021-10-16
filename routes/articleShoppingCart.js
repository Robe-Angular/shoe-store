'use strict'

var express = require('express');
var ArticleShoppingCartController = require('../controllers/articleShoppingCart');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var md_role = require('../middlewares/roleVerify');

api.put('/saveOnCart/:modelId', [md_auth.ensureAuth] ,ArticleShoppingCartController.saveOnCart);

module.exports = api;
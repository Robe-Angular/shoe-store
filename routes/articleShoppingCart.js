'use strict'

var express = require('express');
var ArticleShoppingCartController = require('../controllers/articleShoppingCart');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var md_role = require('../middlewares/roleVerify');

api.put('/saveOnCart/:modelId', [md_auth.ensureAuth] ,ArticleShoppingCartController.saveOnCart);
api.delete('/removeFullCartByUser', [md_auth.ensureAuth] ,ArticleShoppingCartController.removeFullCartUser);
api.delete('/removeFullCartByAdmin/:fullShoppingCartId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ArticleShoppingCartController.removeFullCartAdmin);
api.delete('/removeArticlesShoppingCart/:modelId', [md_auth.ensureAuth] ,ArticleShoppingCartController.removeItem);
api.put('/paypalCreate', [md_auth.ensureAuth] ,ArticleShoppingCartController.paypalCreate);
api.put('/paypalCapture/:orderId', [md_auth.ensureAuth] ,ArticleShoppingCartController.paypalCapture);

module.exports = api;

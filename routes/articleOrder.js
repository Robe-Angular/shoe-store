'use strict'
var express = require('express');
var ArticleOrderController = require('../controllers/articleOrder');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var md_role = require('../middlewares/roleVerify');

api.get('/getAllArticlesOrder/:page?', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ArticleOrderController.getArticleOrdersModelsUsers);
api.get('/getArticlesOrderModelUser/:modelBoot/:userId/:page?', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch(['ROLE_ADMIN'])] ,ArticleOrderController.getArticleOrdersModelsUsers);
api.get('/getArticlesOrderModel/:modelBoot/:page?', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch(['ROLE_ADMIN'])] ,ArticleOrderController.getArticleOrdersModelsUsers);
api.get('/getArticlesOrderUser/:userId/:page?', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch(['ROLE_ADMIN'])] ,ArticleOrderController.getArticleOrdersModelsUsers);
api.get('/getOrdersSended/:sended/:page?', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ArticleOrderController.getOrdersByParams);
api.get('/getOrdersReceived/:received/:page?', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ArticleOrderController.getOrdersByParams);
api.get('/getOrdersSendedByUser/:sended/:userId/:page?', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch(['ROLE_ADMIN'])] ,ArticleOrderController.getOrdersByParams);
api.get('/getOrdersReceivedByUser/:received/:userId/:page?', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch(['ROLE_ADMIN'])] ,ArticleOrderController.getOrdersByParams);
api.put('/sended/:sended/:fullOrderId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ArticleOrderController.setSended);
api.put('/received/:received/:fullOrderId', [md_auth.ensureAuth] ,ArticleOrderController.setReceived);


module.exports = api;
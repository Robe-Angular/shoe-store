'use strict'
var express = require('express');
var ArticleOrderController = require('../controllers/articleOrder');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var md_role = require('../middlewares/roleVerify');

api.get('/getArticlesModelUser/:modelBoot/:userId?/:page?', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch(['ROLE_ADMIN'])] ,ArticleOrderController.getArticleOrdersModelsUsers);
api.get('/getArticlesUser/:userId/:page?', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch(['ROLE_ADMIN'])] ,ArticleOrderController.getArticleOrdersModelsUsers);
api.get('/getAllArticlesSended/:sended/:page?', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ArticleOrderController.getArticleOrdersModelsUsers);
api.get('/getAllArticlesReceived/:received/:page?', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ArticleOrderController.getArticleOrdersModelsUsers);
api.get('/getArticlesSendedByUser/:sended/:userId/:model?/:page?', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch(['ROLE_ADMIN'])] ,ArticleOrderController.getArticleOrdersModelsUsers);
api.get('/getArticlesReceivedByUser/:received/:userId/:model?/:page?', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch(['ROLE_ADMIN'])] ,ArticleOrderController.getArticleOrdersModelsUsers);
api.put('/sended/:sended/:fullOrderId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ArticleOrderController.setSended);
api.put('/received/:received/:fullOrderId', [md_auth.ensureAuth] ,ArticleOrderController.setReceived);


module.exports = api;
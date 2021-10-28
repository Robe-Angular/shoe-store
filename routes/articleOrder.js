'use strict'
var express = require('express');
var ArticleOrderController = require('../controllers/articleOrder');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var md_role = require('../middlewares/roleVerify');

api.get('/getArticlesModelUser/:modelBoot/:userId?/:page?', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch(['ROLE_ADMIN'])] ,ArticleOrderController.getArticleOrdersModelsUsers);
api.get('/getArticlesUser/:userId/:page?', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch(['ROLE_ADMIN'])] ,ArticleOrderController.getArticleOrdersModelsUsers);


module.exports = api;
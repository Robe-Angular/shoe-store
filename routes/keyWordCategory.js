'use strict'

var express = require('express');
var keyWordCategoryController = require('../controllers/keyWordCategory');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var md_role = require('../middlewares/roleVerify');
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/models'});

api.post('/createCategory', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,keyWordCategoryController.createCategory);
api.put('/saveKeyWordOnCategory/:keyWordId/:categoryId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,keyWordCategoryController.saveKeyWordOnCategory);
api.delete('/deleteKeyWordOnCategory/:keyWordId/:categoryId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,keyWordCategoryController.deleteKeyWordOnCategory);
api.delete('/deleteCategory/:categoryId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,keyWordCategoryController.deleteCategory);
api.get('/categories/:page?', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,keyWordCategoryController.getCategories);
api.get('/category/:categoryId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,keyWordCategoryController.getCategory);
module.exports = api;
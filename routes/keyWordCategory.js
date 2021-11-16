'use strict'

var express = require('express');
var keyWordCategoryController = require('../controllers/keyWordCategory');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var md_role = require('../middlewares/roleVerify');
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/models'});

api.post('/createCategory', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,keyWordCategoryController.createCategory);
api.post('/saveKeyWordOnCategory/:keyWordId/:categoryId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,keyWordCategoryController.createCategory);
module.exports = api;
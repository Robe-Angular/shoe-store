'use strict'

var express = require('express');
var keyWordController = require('../controllers/keyWord');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var md_role = require('../middlewares/roleVerify');
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/models'});

api.post('/createKeyWord', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,keyWordController.createKeyWord);
api.post('/searchKeyWord', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,keyWordController.searchKeyWord);
api.delete('/deleteKeyWord/:keyWordId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,keyWordController.deleteKeyWord);
api.put('/saveKeyWordOnModelBoot/:keyWordId/:modelBootId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,keyWordController.saveKeyWordOnModelBoot);

module.exports = api;
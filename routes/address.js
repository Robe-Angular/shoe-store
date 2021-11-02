'use strict'
var express = require('express');
var ArticleOrderController = require('../controllers/address');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var md_role = require('../middlewares/roleVerify');

api.get('/getAddress/:addressId', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch(['ROLE_ADMIN'])] ,ArticleOrderController.getAddress);
api.get('/getAddresses/:userId', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch(['ROLE_ADMIN'])] ,ArticleOrderController.getAddresses);
api.post('/saveAddress', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch([])] ,ArticleOrderController.saveAddress);
api.put('/updateAddress/:addressId', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch([])] ,ArticleOrderController.updateAddress);
api.delete('/deleteAddress/:addressId', [md_auth.ensureAuth, md_role.hasRoleOrUserReqParamsMatch([])] ,ArticleOrderController.deleteAddress);

module.exports = api;
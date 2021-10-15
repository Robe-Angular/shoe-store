'use strict'

var express = require('express');
var DiscountController = require('../controllers/discount');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var md_role = require('../middlewares/roleVerify');

api.post('/saveDiscount', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,DiscountController.saveDiscount);
api.put('/applied/:id', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,DiscountController.booleanAppliedDiscount);
api.put('/updateDiscount/:id', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,DiscountController.updateTitleDescription);
api.delete('/deleteDiscount/:id', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,DiscountController.deleteDiscount);
api.get('/getDiscounts', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,DiscountController.getDiscounts);
module.exports = api;
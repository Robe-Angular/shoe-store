'use strict'

var express = require('express');
var DiscountController = require('../controllers/discount');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var md_role = require('../middlewares/roleVerify');

api.post('/saveDiscount', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,DiscountController.saveDiscount);
api.put('/applied/:id', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,DiscountController.booleanAppliedDiscount);
module.exports = api;
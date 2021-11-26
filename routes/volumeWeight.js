'use strict'
var express = require('express');
var ArticleOrderController = require('../controllers/volumeWeight');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var md_role = require('../middlewares/roleVerify');

api.put('/createPredefinedVolumeWeight/:volume/:weight', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ArticleOrderController.createPredefinedVolumeWeight);
api.delete('/deletePredefinedVolumeWeight/:predefined_v_w_id', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ArticleOrderController.deletePredefinedVolumeWeight);

module.exports = api;
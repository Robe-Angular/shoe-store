'use strict'

var express = require('express');
var ModelBootController = require('../controllers/modelBoot');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var md_role = require('../middlewares/roleVerify');

api.post('/saveModel', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ModelBootController.saveModelBoot);
api.get('/getModel/:modelId', ModelBootController.getModelBootQuantity);
api.get('/getModels/:page?/:sort?', ModelBootController.getAllModels);
api.post('/addQuantity/:modelId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])],ModelBootController.addModelBoot);
api.post('/subtractQuantity/:modelId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])],ModelBootController.subtractModelBoot);

module.exports = api;
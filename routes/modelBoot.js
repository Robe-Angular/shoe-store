'use strict'

var express = require('express');
var ModelBootController = require('../controllers/modelBoot');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/saveModel', md_auth.ensureAuth ,ModelBootController.saveModelBoot);
api.get('/getModel/:modelId', ModelBootController.getModelBootQuantity);


module.exports = api;
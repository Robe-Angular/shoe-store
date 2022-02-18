'use strict'

var express = require('express');
var ModelBootController = require('../controllers/modelBoot');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var md_role = require('../middlewares/roleVerify');
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/models'});

api.post('/saveModel', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ModelBootController.saveModelBoot);
api.delete('/deleteModel/:modelId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ModelBootController.deleteModelBoot);
api.post('/updateModel/:modelId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ModelBootController.updateModelBoot);
api.post('/uploadModelImage/:modelId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN']), md_upload] ,ModelBootController.uploadImages);
api.put('/setMainImage/:modelId/:image', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ModelBootController.setMainImage);
api.delete('/deleteUploadImage/:modelId/:image', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])] ,ModelBootController.deleteUpload);
api.get('/getModel/:modelId', ModelBootController.getModelBootQuantity);
api.get('/getModels/:page?/:sort?', ModelBootController.getAllModels);
api.post('/addQuantity/:modelId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])],ModelBootController.addModelBoot);
api.post('/subtractQuantity/:modelId', [md_auth.ensureAuth, md_role.hasRole(['ROLE_ADMIN'])],ModelBootController.subtractModelBoot);
api.get('/getModelsByParams/:keyWords',ModelBootController.getModelsByParams);
api.get('/getImageModelBoot/:imageFile/:description', ModelBootController.getImageFile);

module.exports = api;
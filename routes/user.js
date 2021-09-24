'use strict'
var express = require('express');
var UserController = require('../controllers/user');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.post('/recover', UserController.recoverPassword);
api.get('/user/:id', md_auth.ensureAuth ,UserController.getUser);
api.get('/users/:page?/:sort?', md_auth.ensureAuth, UserController.getUsers);
api.get('/confirm/:confirmationCode', UserController.verifyUser);

module.exports = api;

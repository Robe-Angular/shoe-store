'use strict'
var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_duo_store',{useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('la conexión a la bd es correcta');
        app.listen(port, () => {
            console.log('Servidor conectado en http://localhost:' + port);
        });
    })
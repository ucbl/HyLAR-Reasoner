#!/usr/bin/env node

var express = require('express'),
    app = express(),

    path = require('path'),
    bodyParser = require('body-parser'),
    multer  = require('multer');

var appDir = path.dirname(require.main.filename),
    ontoDir = appDir + '/ontologies/',
    upload = multer({ dest: ontoDir });

var Controller = require('./controller'),
    Utils = require('../core/Utils');

var port = 3000,
    parsedPort;

process.argv.forEach(function(value, index) {
    if((value=='-p') || (value=='--port')) {
        parsedPort = parseInt(process.argv[index+1]);
        if(parsedPort !== NaN && parsedPort > 0) {
            port = parsedPort;
        }
    }
});

process.argv.forEach(function(value, index) {
    if ((value == '-od') || (value == '--ontology-directory')) {
        ontoDir = process.argv[index + 1];
        upload = multer({ dest: ontoDir });
    }
});

process.on('uncaughtException', function(err) {
    console.error('[HyLAR] Fatal error!');
    throw err;
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

console.log('[HyLAR] Setting up routes...');

// Server utils
app.all('*', Controller.allowCrossDomain);   // Cross domain allowed
app.get('/', Controller.hello);              // Hello world
app.get('/time', Controller.time);

// OWL ontology parsing, getting, classifying
app.get('/ontology/:filename', Controller.getOntology, Controller.sendOntology);
app.get('/classify', Controller.getOntology, Controller.loadOntology, Controller.sendHylarContents);

//SPARQL query processing
app.get('/query', Controller.processSPARQL);

//Ontology listing
app.get('/ontology', Controller.list);

//File uploading
app.post('/ontology', upload.single('file'), Controller.upload);

console.log('[HyLAR] Done.');
console.log('[HyLAR] Exposing server to port ' + port + '...');

// Launching server
app.listen(port);
console.log('[HyLAR] Done.');
console.log('[HyLAR] HyLAR is running.');



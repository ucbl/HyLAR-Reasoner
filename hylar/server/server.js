#!/usr/bin/env node

var express = require('express'),
    app = express();

var bodyParser = require('body-parser'),
    busboy  = require('connect-busboy');

var OntologyController = require('./controller'),
    Utils = require('../core/jsw/Utils');

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

process.on('uncaughtException', function(err) {
    console.error('[HyLAR] Fatal error!');
    throw err;
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(busboy({ immediate: true }));

// parse application/json
app.use(bodyParser.json());

console.log('[HyLAR] Setting up routes...');

// Server utils
app.all('*', Utils.allowCrossDomain);   // Cross domain allowed
app.get('/', Utils.hello);              // Hello world
app.get('/time', Utils.time);

// OWL ontology parsing, getting, classifying
app.get('/ontology/:filename', OntologyController.getOntology, OntologyController.sendOntology);
app.get('/classify', OntologyController.getOntology, OntologyController.parseString, OntologyController.generateReasoner, OntologyController.sendClassificationData);

//SPARQL query processing
app.get('/query', OntologyController.processSPARQL);

//File uploading
app.post('/ontology', OntologyController.upload);

//Ontology listing
app.get('/ontology', OntologyController.list);

//External full step reasoning, no caching
app.get('/sparql',  OntologyController.getExternalOntology, OntologyController.parseString, OntologyController.generateReasoner,
                    OntologyController.processSPARQL);

console.log('[HyLAR] Done.');
console.log('[HyLAR] Exposing server to port ' + port + '...');

// Launching server
app.listen(port);
console.log('[HyLAR] Done.');
console.log('[HyLAR] HyLAR is running.');



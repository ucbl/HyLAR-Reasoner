/**
 * Created by Spadon on 02/10/2014.
 */
var express = require('express'),
    app = express();

var bodyParser = require('body-parser'),
    busboy  = require('connect-busboy');

var OntologyController = require('./core/controller'),
    Utils = require('./core/jsw/Utils');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.use(busboy({ immediate: true }));

// parse application/json
app.use(bodyParser.json())

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

//Time

// Launching server
app.listen(3000);


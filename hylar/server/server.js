#!/usr/bin/env node

var h = require('../hylar');

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    multer  = require('multer');

var asciify = require("asciify"),
    chalkRainbow = require('chalk-rainbow')

var Controller = require('./controller'),
    Utils = require('../core/Utils');

var ontoDir = Controller.configuration.ontoDir,
    port = Controller.configuration.port,
    upload = multer({ dest: ontoDir });

process.on('uncaughtException', function(err) {
    h.displayError(err);
});

app.set('view engine', 'ejs');

// parse text/plain
app.use(function(req, res, next){
    if (req.is('text/*')) {
        req.text = '';
        req.setEncoding('utf8');
        req.on('data', function(chunk){ req.text += chunk });
        req.on('end', next);
    } else {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    }
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// CSS & images & js
app.use('/css', express.static(__dirname + '/css'));
app.use('/img', express.static(__dirname + '/images'));
app.use('/js', express.static(__dirname + '/js'));

// parse application/json
app.use(bodyParser.json());

// Server utils
app.get('/', Controller.hello);
app.get('/time', Controller.time);
app.get('/status', Controller.status)

app.get('/export', Controller.sendHylarContents);
app.get('/import', Controller.importHylarContents);

// OWL ontology uploading, parsing, getting, classifying
app.get('/ontology', Controller.list);
app.post('/ontology', upload.single('file'), Controller.upload);
app.get('/ontology/:filename', Controller.getOntology, Controller.sendOntology);
app.delete('/ontology/:filename', Controller.removeOntology, Controller.acknowledgeEnd);
app.get('/remove/:filename', Controller.removeOntology, Controller.hello);

app.get('/classify/:filename', Controller.getOntology, Controller.loadOntology, Controller.hello);
app.get('/classifyRemotely/:filename', Controller.getOntology, Controller.loadOntology, Controller.sendHylarContents);
app.post('/classify', Controller.escapeStrOntology, Controller.loadOntology, Controller.acknowledgeEnd);

// Rule adding, listing
app.put('/rule', Controller.addRules, Controller.acknowledgeEnd);
app.get('/rule', Controller.listRules);
app.get('/rule/remove/:ruleIndex', Controller.removeRule, Controller.renderRules);

// SPARQL query processing
app.post('/query', Controller.processSPARQL);
app.get('/query', Controller.processSPARQL);

// SPARQL endpoint interface
app.get('/sparql', Controller.sparqlInterface);
app.post('/sparql', Controller.simpleSparql, Controller.sparqlInterface);

// KB and rules explorer interface
app.get('/explore', Controller.renderFact);
app.get('/explore/:graph/:fact', Controller.renderFact);
app.get('/explore/resetKB', Controller.resetKB, Controller.renderFact);
app.get('/explore/rules', Controller.renderRules);
app.get('/explore/resetRules', Controller.resetRules, Controller.renderRules);
app.post('/explore/rules', Controller.addRules, Controller.renderRules);

// Launching server

app.get('/demo', Controller.geoloc);

(async() => {
    await new Promise((resolve, reject) => {
        try {
            app.listen(port, function () {
                Utils._instanceid = port;
                asciify('HyLAR', {font: 'larry3d'}, function (err, result) {
                    console.log(chalkRainbow(result));
                    h.notify(`⭐ [ Ver. ${require('../../package.json').version} ] Now running on port ${port} ⭐`)
                    resolve()
                })
            })
        } catch (err) {
            throw err
        }
    })
})()

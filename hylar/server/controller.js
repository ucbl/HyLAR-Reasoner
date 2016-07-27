/**
 * Created by Spadon on 02/10/2014.
 */

var fs = require('fs'),
    path = require('path'),
    request = require('request'),
    mime = require('mime-types');

var escape = require('escape-html');

var h = require('../hylar');
var Hylar = new h();
var Utils = require('../core/Utils');
var Logics = require('../core/Logics/Logics');

var appDir = path.dirname(require.main.filename),
    ontoDir = appDir + '/ontologies',
    htmlDir = appDir + '/views',
    port = 3000,
    parsedPort;

process.argv.forEach(function(value, index) {
    if ((value == '-od') || (value == '--ontology-directory')) {
        ontoDir = path.resolve(process.argv[index + 1]);
    }
});

process.argv.forEach(function(value, index) {
    if((value=='-p') || (value=='--port')) {
        parsedPort = parseInt(process.argv[index+1]);
        if(parsedPort !== NaN && parsedPort > 0) {
            port = parsedPort;
        }
    }
});

Hylar.setTagBased();

module.exports = {

    /**
     * Server configuration
     */
    configuration: {
        appDir: appDir,
        ontoDir: ontoDir,
        port: port
    },

    /**
     * OWL File content to text
     * @param req
     * @param res
     * @param next
     */
    getOntology: function(req, res, next) {
        var initialTime = req.body.time,
            receivedReqTime = new Date().getTime(),
            filename = req.params.filename,
            absolutePathToFile = ontoDir + '/' + filename,
            extension = path.extname(absolutePathToFile),
            contentType = mime.contentType(extension);

        if(contentType) {
            req.mimeType = contentType.replace(/;.*/g, '');
        } else {
            req.mimeType = contentType;
        }

        req.requestDelay =  receivedReqTime - initialTime;

        fs.readFile(absolutePathToFile, function(err, data) {
            if(err) {
                res.status(500).send(err.toString());
            } else {
                req.rawOntology = data.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');
                next();
            };
        });
    },

    loadOntology: function(req, res, next) {
        var rawOntology = req.rawOntology,
            mimeType = req.mimeType,
            initialTime = new Date().getTime();

        Hylar.load(rawOntology, mimeType, req.body.reasoningMethod)
            .then(function() {
                req.processingDelay  = new Date().getTime() - initialTime;
                next();
            })
            .catch(function(error) {
                console.error(error.stack);
                res.status(500).send(error.stack);
            });
    },

    escapeStrOntology: function(req, res, next) {
        req.rawOntology  = req.body.content.replace(/(&)([a-z0-9]+)(;)/gi, '$2:');
        req.mimeType = req.body.mimetype;
        next();
    },

    acknowledgeEnd: function(req, res) {
        res.send(true);
    },

    sendHylarContents: function(req, res) {
        Hylar.getStorage().then(function(hylarStorage) {
            res.status(200).json({
                data: {
                    storage: hylarStorage,
                    dictionary: Hylar.getDictionary()
                },
                processingDelay: req.processingDelay,
                requestDelay : req.requestDelay,
                serverTime : new Date().getTime()
            });
        });
    },

    /**
     * End-method returning an ontology
     * @param req
     * @param res
     */
    sendOntology: function(req, res) {
        res.header('Content-Type', 'text/json');
        res.status(200).json({
            data: {
                ontologyTxt: req.rawOntology,
                mimeType: req.mimeType
            },
            requestDelay: req.requestDelay,
            serverTime: new Date().getTime()
        });
    },

    processSPARQL: function(req, res) {
        var initialTime = req.body.time,
            receivedReqTime = new Date().getTime(),
            requestDelay =  receivedReqTime - initialTime,
            processedTime;

        Hylar.query(req.body.query, req.body.reasoningMethod)
            .then(function(results) {
                processedTime = new Date().getTime();

                res.status(200).send({
                    data : results,
                    processingDelay: processedTime - receivedReqTime,
                    requestDelay : requestDelay,
                    serverTime : new Date().getTime()
                });
            })
            .catch(function(error) {
                console.error(error.stack);
                res.status(500).send(error.stack);
            });
    },

    list: function(req, res) {
        res.send(fs.readdirSync(ontoDir));
    },

    /**
     * External OWL File content to text
     * @param req
     * @param res
     * @param next
     */
    getExternalOntology: function(req, res, next) {
        var initialTime = 0,
            receivedReqTime = new Date().getTime();

        req.requestDelay =  receivedReqTime - initialTime;
        var url = req.body.url;

        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                req.rawOntology = body.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');
                next();
            }
        });
    },

    /**
     * Simple HelloWorld
     * @param req
     * @param res
     */
    hello: function(req, res) {
        var ontologies = fs.readdirSync(ontoDir), kb = Hylar.getDictionary().values(),
            nbExplicit = Logics.getOnlyExplicitFacts(kb).length,
            nbImplicit = kb.length - nbExplicit,
            consistent = Hylar.checkConsistency().consistent;

        res.render(htmlDir + '/pages/index', {
            kb: kb,
            ontologies: ontologies,
            nbExplicit: nbExplicit,
            nbImplicit: nbImplicit,
            consistent: consistent
        });
    },

    /**
     * CORS Middleware
     * @param req
     * @param res
     */
    allowCrossDomain: function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    },

    /** Current server time */
    time: function(req, res) {
        res.status(200).json({
            ms: new Date().getTime()
        });
    },

    upload: function(req, res) {
        fs.renameSync(req.file.destination + req.file.filename, req.file.destination + req.file.originalname);
        res.json({
            filename: req.file.originalname,
            list: fs.readdirSync(ontoDir)
        });
    },

    renderFact: function(req, res) {
        var uri = req.params.uri, dict = Hylar.getDictionary(), kb = [], graph,
            lookup, key, fact, derivations, factName, content = dict.content();

        if (!uri) {
            for (var graph in content) {
                for (var dictKey in content[graph]) {
                    var values = dict.get(dictKey, graph);
                    for (var i = 0; i < values.length; i++) {
                        kb.push(values[i]);
                    }
                }
            }
        } else {
            lookup = dict.getFactFromStringRepresentation(decodeURIComponent(uri));
            key = lookup.key;
            fact = lookup.value;
            if ((fact === undefined) && (key === undefined)) {
                res.status(404).render(htmlDir + '/pages/404');
                return;
            } else {
                factName = escape(fact.toString());
                derivations = fact.derives(dict.values());
                graph = lookup.graph;
            }
        }

        res.render(htmlDir + '/pages/explore', {
            kb: kb,
            fact: fact,
            factName: factName,
            factTriple: escape(key),
            derivations: derivations,
            graph: graph
        });

    },

    simpleSparql: function(req, res, next) {
        //noinspection JSValidateTypes
        if (req.body.query !== undefined) {
            try {
                Hylar.query(req.body.query).then(function (result) {
                    req.sparqlResults = result;
                    req.sparqlQuery = req.body.query;
                    next();
                });
            } catch (StorageNotInitializedException) {
                req.error = StorageNotInitializedException;
                next();
            }
        } else {
            next();
        }
    },

    sparqlInterface: function(req, res) {
        res.render(htmlDir + '/pages/sparql', {
            sparqlQuery: (req.sparqlQuery ? req.sparqlQuery : 'SELECT * { ?s ?p ?o . }'),
            prevResults: (req.sparqlResults ? req.sparqlResults : ''),
            error: (req.error ? req.error: '')
        });
    },

    addRules: function(req, res, next) {
        var rules = req.body.rules,
            parsedRules = Logics.parseRules(rules);
        Hylar.addRules(parsedRules);
        next();
    },

    listRules: function(req, res) {
        res.json({'rules': Hylar.rules.toString()});
    }
};

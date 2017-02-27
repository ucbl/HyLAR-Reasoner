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
    parsedPort,
    contextPath = "";

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

process.argv.forEach(function(value, index) {
    if((value=='-rm') || (value=='--reasoning-method')) {
        if (process.argv[index + 1] == 'tagBased') {
            Hylar.setTagBased();
        } else {
            Hylar.setIncremental();
        }
    }
});

process.argv.forEach(function(value, index) {
    if((value=='-cp') || (value=='--context-path')) {
        contextPath = "/" + process.argv[index + 1];
        console.log(contextPath);
    }
});

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
        var initialTime = req.query.time,
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
            graph = req.graph,
            initialTime = new Date().getTime();

            Hylar.load(rawOntology, mimeType, req.query.keepoldvalues, graph, req.body.reasoningMethod)
                .then(function() {
                    req.processingDelay  = new Date().getTime() - initialTime;
                    console.notify("Classification finished in " + req.processingDelay + "ms.");
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
        req.graph = req.body.graph;
        next();
    },

    acknowledgeEnd: function(req, res) {
        res.send(true);
    },

    sendHylarContents: function(req, res) {
        res.status(200).json({
            dictionary: Hylar.getDictionary(),
            processingDelay: req.processingDelay,
            requestDelay : req.requestDelay,
            serverTime : new Date().getTime()
        });
    },

    /**
     * End-method returning an ontology
     * @param req
     * @param res
     */
    sendOntology: function(req, res) {
        if (req.headers.accept == 'application/json') {
            res.header('Content-Type', 'application/json');
            res.status(200).json({
                data: {
                    ontologyTxt: req.rawOntology,
                    mimeType: req.mimeType
                },
                requestDelay: req.requestDelay,
                serverTime: new Date().getTime()
            });
        } else {
            res.header('Content-Type', req.mimeType);
            res.status(200).send(req.rawOntology);
        }
    },

    removeOntology: function(req, res, next) {
        fs.unlinkSync(ontoDir + '/' + req.params.filename);
        next();
    },

    processSPARQL: function(req, res) {
        var initialTime = req.query.time,
            asString = req.body.asString,
            receivedReqTime = new Date().getTime(),
            requestDelay =  receivedReqTime - initialTime,
            processedTime;


        Hylar.query(req.body.query, req.body.reasoningMethod)
        .then(function(results) {
            processedTime = new Date().getTime();

            if (asString && results.triples && results.triples.length) {
                asString = "";
                for (var i = 0; i < results.triples.length; i++) {
                    asString += results.triples[i].toString() + " ";
                }
                res.status(200).send(asString);
            }

            console.notify("Evaluation finished in " + processedTime - receivedReqTime + "ms.");

            if (req.headers.accept == 'application/sparql-results+json') {
                res.status(200).send(results);
            } else {
                res.status(200).send({
                    data: results,
                    processingDelay: processedTime - receivedReqTime,
                    requestDelay: requestDelay,
                    serverTime: new Date().getTime()
                });
            }
        })
        .catch(function(error) {
            console.error(error.stack);
            res.status(500).send(error.stack);
        })

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
            consistent: consistent,
            contextPath: contextPath
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

    upload: function(req, res, next) {
        fs.renameSync(req.file.path, path.normalize(req.file.destination + '/' + req.file.originalname));
        next();
    },

    renderFact: function(req, res) {
        var uri = req.params.fact, dict = Hylar.getDictionary(), graph = decodeURIComponent(req.params.graph),
            kb = [], content = dict.content(), lookup, key, fact, derivations, factName;

        if (!uri) {
            for (var graph in content) {
                for (var dictKey in content[graph]) {
                    var values = dict.get(dictKey, graph);
                    for (var i = 0; i < values.length; i++) {
                        kb.push({
                            val: values[i],
                            graph: graph
                        });
                    }
                }
            }
        } else {
            lookup = dict.getFactFromStringRepresentation(decodeURIComponent(uri), graph);
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
            graph: graph,
            contextPath: contextPath
        });
    },

    simpleSparql: function(req, res, next) {
        //noinspection JSValidateTypes
        var start = new Date().getTime(), processingDelay;
        if (req.body.query !== undefined) {
            try {
                Hylar.query(req.body.query).then(function (result) {
                    processingDelay = new Date().getTime() - start;
                    console.notify("Evaluation finished in " + processingDelay + "ms.");
                    req.sparqlResults = result;
                    req.sparqlQuery = req.body.query;
                    Hylar.addToQueryHistory(req.sparqlQuery, true);
                    next();
                })
            } catch(e) {
                Hylar.addToQueryHistory(req.body.query, false);
                req.error = e;
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
            history: Hylar.queryHistory,
            error: (req.error ? req.error: ''),
            contextPath: contextPath
        });
    },

    renderRules: function(req, res) {
        res.render(htmlDir + '/pages/rules', {
            rules: Hylar.getRulesAsStringArray(),
            error: req.error,
            contextPath: contextPath
        });
    },

    addRules: function(req, res, next) {
        var rules = req.body.rules,
            parsedRules;
        if (req.body.rule !== undefined) {
            try {
                Hylar.addRule(Logics.parseRule(req.body.rule), req.body.rulename);
            } catch(e) {
                req.error = "Rule parse error!";
            }
        } else {
            try {
                parsedRules = Logics.parseRules(rules);
                Hylar.addRules(parsedRules);
            } catch (e) {
                req.error = "Rule parse error!";
            }
        }
        next();
    },

    resetRules: function(req, res, next) {
        Hylar.resetRules();
        next();
    },

    removeRule: function(req, res, next) {
        var ruleIndex = req.params.ruleIndex;
        Hylar.removeRule(ruleIndex);
        next();
    },

    listRules: function(req, res) {
        res.json({'rules': Hylar.rules.toString()});
    },

    resetKB: function(req, res, next) {
        Hylar.clean();
        next();
    },

    geoloc: function(req, res) {
        Hylar.setRules(OWL2RL.rules.classSubsumption
            .concat(OWL2RL.rules.propertySubsumption)
            .concat(OWL2RL.rules.transitivity)
            .concat(OWL2RL.rules.inverse)
            .concat(OWL2RL.rules.equivalence)
            .concat(OWL2RL.rules.equality));
        res.render(htmlDir + '/pages/blend_geoloc', {});
    },

};

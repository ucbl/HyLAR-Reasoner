/**
 * Created by Spadon on 02/10/2014.
 */

const fs = require('fs'),
    path = require('path'),
    mime = require('mime-types');

const h = require('../hylar');
const Logics = require('../core/Logics/Logics');
const ContentNegotiator = require('./content_negotiator')

let appDir = path.dirname(require.main.filename),
    ontoDir = appDir + '/ontologies',
    htmlDir = appDir + '/views',
    port = 3000,
    parsedPort,
    contextPath = ""

let persistent = true
let entailment = 'owl2rl'

process.argv.forEach(function(value, index) {
    if((value=='--no-persist')) {
        persistent = false
    }
});

process.argv.forEach(function(value, index) {
    if((value=='--entailment') || (value == '-e')) {
        entailment = process.argv[index + 1]
    }
});

const Hylar = new h({
    persistent, entailment
});

process.argv.forEach(function(value, index) {
    if ((value == '-od') || (value == '--ontology-directory') || (value == '-gd') || (value == '--graph-directory')) {
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
        if (['tagBased', 'tag-based'].includes(process.argv[index + 1])) {
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

process.argv.forEach(function(value, index) {
    if((value=='-x') || (value=='--reasoning-off')) {
        Hylar.setReasoningOff()
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

    status: function(req, res) {
        res.status(200).json({
            lastLog: Hylar.lastLog()
        })
    },

    /**
     * OWL File content to text
     * @param req
     * @param res
     * @param next
     */
    getOntology: function(req, res, next) {
        let initialTime = req.query.time,
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

    loadOntology: async function(req, res, next) {
        let rawOntology = req.rawOntology,
            mimeType = req.mimeType,
            graph = req.graph,
            initialTime = new Date().getTime();

        try {
            await Hylar.load(rawOntology, mimeType, req.query.keepoldvalues, graph, req.body.reasoningMethod)
            req.processingDelay = new Date().getTime() - initialTime;
            h.success(`Classification of ${req.params.filename} finished in ${req.processingDelay} ms.`);
            next()

        } catch(error) {
            h.displayError(error);
            res.status(500).send(error.stack);
        }
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

    importHylarContents: async function(req, res) {
        let importedData;
        fs.readFile(ontoDir + "/export.json", function(err, data) {
            if(err) {
                res.status(500).send(err.toString());
            } else {
                importedData = data.toString();
                try {
                    let value = await
                    Hylar.import(JSON.parse(importedData).dictionary)
                    res.send({status: value});
                } catch(err) {
                    res.status(500).json({err: err.toString});
                }
            }
        })
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
        h.notify(`File ${req.params.filename} removed`)
        next();

    },

    processSPARQL: async function(req, res) {
        let results = {}, asString = req.body.asString
        let initialTime = req.query.time,
            receivedReqTime = new Date().getTime(),
            requestDelay =  receivedReqTime - initialTime,
            processedTime = -1;

        // Actual sparql query
		let query = req.body.query || req.body.update || req.query.query
        // Drop it if the query is null
		if (!query) ContentNegotiator.answerSparqlWithContentNegotiation(req, res)

        // Process query if it is set
        try {
            results = await Hylar.query(query, req.body.reasoningMethod)
            processedTime = new Date().getTime();

            let hylar_meta = {
                processingDelay: processedTime - receivedReqTime,
                requestDelay: requestDelay,
                serverTime: new Date().getTime()
            }
            let totalTime = processedTime - receivedReqTime;
            let params = { results, totalTime };

            h.success("Evaluation finished in " + (totalTime) + "ms.");

            Hylar.addToQueryHistory(req.body.query, true);

            if (asString) {
                if (results.triples && results.triples.length) {
                    asString = "";
                    for (let i = 0; i < results.triples.length; i++) {
                        asString += results.triples[i].toString() + " ";
                    }
                    res.send(asString);
                }
            } else {
                ContentNegotiator.answerSparqlWithContentNegotiation(req, res, params)
            }
        } catch(error) {
            Hylar.addToQueryHistory(req.body.query, false);
            res.status(500).send(error.message);
        }
    },

    list: function(req, res) {
        res.send(fs.readdirSync(ontoDir));
    },

    /**
     * Simple HelloWorld
     * @param req
     * @param res
     */
    hello: function(req, res) {
        let ontologies = fs.readdirSync(ontoDir), kb = Hylar.getDictionary().values();

        res.render(htmlDir + '/pages/index', {
            kb: kb,
            ontologies: ontologies,
            contextPath: contextPath,
            entailment: Hylar.entailment.toUpperCase()
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
        res.status(200).json({
            fileName: req.file.originalname
        })
        h.notify(`File ${req.file.originalname} loaded and ready to process`)
    },

    renderFacts: function(req, res) {
        let dict = Hylar.getDictionary()
        let content = dict.content()
        let graph = decodeURIComponent(req.params.graph)
        let consistent = Hylar.checkConsistency().consistent

        const prepareFactForPresentation = (fact, graph) => {
            return {
                graph,
                asString: fact.asString,
                rule: fact.rule,
                subject: Hylar.prefixes.replaceUriWithPrefix(fact.subject),
                predicate: Hylar.prefixes.replaceUriWithPrefix(fact.predicate),
                object: Hylar.prefixes.replaceUriWithPrefix(fact.object),
                isValid: fact.isValid(),
                isAxiom: fact.isAxiom,
                explicit: fact.explicit,
                causedBy: fact.causedBy,
                _self: fact
            }
        }

        let kb = []

        for (let graph in content) {
            for (let dictKey in content[graph]) {
                let values = dict.get(dictKey, graph);
                for (let i = 0; i < values.length; i++) {
                    kb.push(prepareFactForPresentation(values[i], graph))
                }
            }
        }

        let axioms = Hylar.axioms.map(axiom => {
            return prepareFactForPresentation(axiom, '_:axiomatic_triples')
        })

        res.render(htmlDir + '/pages/explore', {
            kb: kb.concat(axioms),
            graph: graph,
            contextPath: contextPath,
            consistent,
            entailment: Hylar.entailment.toUpperCase(),
            axioms,
            isTagBased: Hylar.reasoningMethod == 'tagBased'
        });
    },

    simpleSparql: async function(req, res, next) {
        //noinspection JSValidateTypes
        let start = new Date().getTime(), processingDelay;
        if (req.body.query !== undefined) {
            try {
                let result = await Hylar.query(req.body.query)
                    processingDelay = new Date().getTime() - start;
                    h.success("Evaluation finished in " + processingDelay + "ms.");
                    req.sparqlResults = result;
                    req.sparqlQuery = req.body.query;
                    Hylar.addToQueryHistory(req.sparqlQuery, true);
                    next();
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
            prefixes: Hylar.prefixes.entries(),
            rules: Hylar.getRulesAsStringArray(),
            error: req.error,
            contextPath: contextPath
        });
    },

    addRules: async function(req, res, next) {
        let rules = req.body.rules,
            parsedRules;
        if (req.body.rule !== undefined) {
            try {
                await Hylar.addRule(Logics.parseRule(req.body.rule, req.body.rulename));
                next();
            } catch(e) {
                res.status(500).send(e.stack)
            }
        } else {
            try {
                parsedRules = Logics.parseRules(rules);
                await Hylar.addRules(parsedRules);
                next();
            } catch (e) {
                res.status(500).send(e.stack)
            }
        }
    },

    resetRules: async function(req, res, next) {
        await Hylar.resetRules();
        next();
    },

    removeRule: async function(req, res, next) {
        let name = req.params.name;
        await Hylar.removeRuleByName(name);
        next();
    },

    listRules: function(req, res) {
        res.json({'rules': Hylar.rules.toString()});
    },

    resetKB: function(req, res, next) {
        Hylar.clean();
        next();
    },
};

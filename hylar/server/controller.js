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

var createLink = function(value, url) {
        if (url) {
            url = url;
        } else {
            url = '/explore/'
        }
        return '<a href="http://localhost:'+port+url+encodeURIComponent(value)+'">'+escape(value)+'</a></br>'
    },
    createTitle = function(title) {
        return '<h3>'+title+'</h3>'
    };

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
        var initialTime = req.param('time'),
            receivedReqTime = new Date().getTime(),
            filename = req.param('filename'),
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

        Hylar.load(rawOntology, mimeType, req.param('reasoningMethod'))
            .then(function() {
                req.processingDelay  = new Date().getTime() - initialTime;
                next();
            });
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
        var initialTime = req.param('time'),
            receivedReqTime = new Date().getTime(),
            requestDelay =  receivedReqTime - initialTime,
            processedTime;

        Hylar.query(req.param('query'), req.param('reasoningMethod'))
            .then(function(results) {
                processedTime = new Date().getTime();

                res.status(200).send({
                    data : results,
                    processingDelay: processedTime - receivedReqTime,
                    requestDelay : requestDelay,
                    serverTime : new Date().getTime()
                });
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
        var url = req.param('url');

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
        var html = '', ontologies = fs.readdirSync(ontoDir), kb = Hylar.getDictionary().values();

        html += createTitle('Statistics');
        html += 'The knowledge base currently contains ' + kb.length + ' facts.<br/>';
        html += Logics.getOnlyExplicitFacts(kb).length + ' are explicit and ' + Logics.getOnlyImplicitFacts(kb).length + ' are implicit.<br/>';
        html += createTitle('Available ontologies');

        for (var i = 0; i < ontologies.length; i++) {
            html += createLink(ontologies[i], '/ontology/');
        }

        res.render(htmlDir + '/pages/index', {
            content: html
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
        var uri = req.param('uri'), dict = Hylar.getDictionary(), html = '',
            lookup, key, fact, derivations, values;
        if(!uri) {
            html += createTitle('KB facts');
            for(var key in dict.content()) {
                values = dict.get(key);
                for (var i = 0; i < values.length; i++) {
                    html += createLink(values[i]);
                }
            }
        } else {
            lookup = dict.getFactFromStringRepresentation(decodeURIComponent(uri));
            key = lookup.key;
            fact = lookup.value;
            if ((fact !== undefined) && (key !== undefined)) {
                html += '<h2>' + fact.toString() + '</h2>';
                html += (fact.explicit ? '<span class="label label-primary">EXPLICIT</span>' : '<span class="label label-info">IMPLICIT</span>')
                html += (fact.isValid() ? '&nbsp;<span class="label label-success">VALID</span>' : '&nbsp;<span class="label label-danger">NOT VALID</span>')

                html += createTitle('Equivalent as triple');
                html += '&nbsp<code>'+escape(key)+'</code>';

                for (var i = 0; i < fact.causedBy.length; i++) {
                    html += createTitle('Derived from');
                    for (var j = 0; j < fact.causedBy[i].length; j++) {
                        html += createLink(fact.causedBy[i][j].toString());
                        if (!(j+1==fact.causedBy[i].length)) {
                            html += 'AND<br/>';
                        }
                    }
                }

                if (fact.implicitCauses.length > 0) {
                    html += createTitle('Implicit causes');
                    for (var i = 0; i < fact.implicitCauses.length; i++) {
                        html += createLink(fact.implicitCauses[i].toString());
                        if (!(i+1==fact.implicitCauses.length)) {
                            html += 'AND<br/>';
                        }
                    }
                }

                derivations = fact.derives(dict.values());
                if (derivations.length > 0) {
                    html += createTitle('Derives');
                    for (var j = 0; j < derivations.length; j++) {
                        html += createLink(derivations[j].toString());
                        if (!(j+1==derivations.length)) {
                            html += 'AND<br/>';
                        }
                    }

                }

            } else {
                res.render(htmlDir + '/pages/index', {
                    content: '<h2>Fact not found.</h2>'
                });
                return;
            }
        }
        res.render(htmlDir + '/pages/index', {
            content: html
        });
    }
};

/**
 * Created by Spadon on 02/10/2014.
 */

var fs = require('fs'),
    path = require('path'),
    request = require('request'),

    JswParser = require('../core/jsw/JswParser'),
    Reasoner = require('../core/jsw/Reasoner'),
    JswSPARQL = require('../core/jsw/JswSPARQL'),
    ReasoningEngine = require('../core/jsw/ReasoningEngine'),
    OWL2RL = require('../core/jsw/OWL2RL'),

    ClassificationData = null,
    stringifiedReasoner = null,
    appDir = path.dirname(require.main.filename),
    ontoDir = appDir + '/ontologies/',
    dbDir = appDir + '/db/';

module.exports = {

    /**
     * OWL File content to text
     * @param req
     * @param res
     * @param next
     */
    getOntology: function(req, res, next) {
        var initialTime = req.param('time'),
            receivedReqTime = new Date().getTime();

        req.requestDelay =  receivedReqTime - initialTime;
        var filename = req.param('filename');

        fs.readFile(ontoDir + filename, function(err, data) {
            if(err) {
                res.status(500).send(err.toString());
            } else {
                req.owl = data.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');
                next();
            };
        });
    },

    /**
     * String parser
     * @param req
     * @param res
     */
    parseString: function(req, res, next) {
        var rdfXml = req.owl,
            ontology = JswParser.parse(rdfXml,
                function(err) {
                    res.status(500).send(err);
                });

        req.ontology = ontology;
        next();
    },

    generateReasoner: function(req, res, next) {
        var ontology = req.ontology,
            initialTime = new Date().getTime(),
            RMethod;
        if (req.param('reasoningMethod') == 'incremental') RMethod = ReasoningEngine.incremental;

        var reasoner = new Reasoner.create(ontology, RMethod);

        req.processingDelay  = new Date().getTime() - initialTime;
        req.classificationData = {
            reasoner: reasoner,
            ontology: ontology
        };

        next();
    },

    sendClassificationData: function(req, res) {
        var seen = [];
        ClassificationData = req.classificationData;
        stringifiedReasoner = JSON.stringify(ClassificationData.reasoner, function(key, val) {
            if (val != null && typeof val == "object") {
                if (seen.indexOf(val) >= 0)
                    return;
                seen.push(val)
            }
            return val
        });

        if(!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir);
        }

        fs.writeFileSync(dbDir + req.param('filename') + '.json',
            '{' +
                'reasoner: ' + stringifiedReasoner + ',' +
                'ontology: ' + JSON.stringify(ClassificationData.ontology) +
            '}'
        );

        res.status(200).send({
            data : {
                reasoner: stringifiedReasoner,
                ontology: ClassificationData.ontology,
                requestDelay: req.requestDelay,
                processingDelay: req.processingDelay,
                time: new Date().getTime(),
                name: req.param('filename')
            }
        });
    },

    /**
     * End-method returning an ontology
     * @param req
     * @param res
     */
    sendOntology: function(req, res) {
        res.send({
            'data': {
                'ontology': req.owl,
                'requestDelay': req.requestDelay,
                'time': new Date().getTime(),
                'name': req.param('filename')
            }
        });
    },

    processSPARQL: function(req, res) {
        var initialTime = req.param('time'),
            receivedReqTime = new Date().getTime(),
            requestDelay =  receivedReqTime - initialTime,
            processedTime;

        if(req.classificationData) {
          ClassificationData = req.classificationData;
        }

        if(!ClassificationData) {
            processedTime = new Date().getTime();
            res.status(500).send({
                data : 'Reasoner not initialized!',
                processingDelay: 0,
                requestDelay : requestDelay,
                time: processedTime
            });
        } else {
            var sparql = JswSPARQL.sparql,
                query = sparql.parse(req.param('query')),
                results, RMethod;

            if (req.param('reasoningMethod') == 'incremental') RMethod = ReasoningEngine.incremental;
            results = ClassificationData.reasoner.aBox.answerQuery(query, ClassificationData.reasoner.resultOntology, OWL2RL.rules, RMethod);

            processedTime = new Date().getTime();
            res.status(200).send({
                data : results,
                processingDelay: processedTime - receivedReqTime,
                requestDelay : requestDelay,
                time : new Date().getTime()
            });
        }
    },

    upload: function(req, res) {
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {

            if(!fs.existsSync(ontoDir)) {
                fs.mkdirSync(ontoDir);
            }

            var filePath = ontoDir + filename,
                fstream = fs.createWriteStream(filePath), list;
            file.pipe(fstream).on('finish', function () {
                list = fs.readdirSync(ontoDir);
                res.json({
                    filename: filename,
                    list: list
                });
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
          req.owl = body.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');
          next();
        }
      });
    }
};

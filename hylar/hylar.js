/**
 * Created by Spadon on 02/10/2014.
 */

var fs = require('fs');

    JswParser = require('./core/JswParser'),
    JswReasoner = require('./core/Reasoner'),
    JswSPARQL = require('./core/JswSPARQL'),
    ReasoningEngine = require('./core/ReasoningEngine'),
    OWL2RL = require('./core/OWL2RL');


function HyLAR() {
    this.ClassificationData = null;
}

/**
 * Classifies an ontology
 * @param filepath The full path of the owl file
 */
HyLAR.prototype.classify = function (filepath) {

    var rdfXml, ontology, reasoner, RMethod = ReasoningEngine.incremental;

    rdfXml = fs.readFileSync(filepath).toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');

    ontology = JswParser.parse(rdfXml, function (err) {
        if (err) {
            throw err;
        }
    });

    reasoner = new JswReasoner.create(ontology, RMethod);

    if (!reasoner) {
        throw 'Error while classifying';
    } else {
        this.ClassificationData = {
            reasoner: reasoner,
            ontology: ontology
        };

        return this.ClassificationData;
    }
}

/**
 * Answers a SPARQL query against the reasoner instance
 * @param query The query text
 */
HyLAR.prototype.query = function (query) {

    var sparql = JswSPARQL.sparql,
        results, RMethod = ReasoningEngine.incremental,
        parsedQuery = sparql.parse(query);

    if (!this.ClassificationData) {
        throw 'Reasoner not initialized!';
    } else {
        results = this.ClassificationData.reasoner.aBox.answerQuery(parsedQuery, this.ClassificationData.reasoner.resultOntology, OWL2RL.rules, RMethod);
        return {
            data: results
        };
    }
};

module.exports = HyLAR;
/**
 * Created by Spadon on 02/10/2014.
 */

var fs = require('fs');

    JswParser = require('./jsw/JswParser'),
    JswReasoner = require('./jsw/Reasoner'),
    JswSPARQL = require('./jsw/JswSPARQL'),
    ReasoningEngine = require('./jsw/ReasoningEngine'),
    OWL2RL = require('./jsw/OWL2RL'),

    ClassificationData = null;

module.exports = {
    /**
     * Classifies an ontology
     * @param filepath The full path of the owl file
     */
    classify: function(filepath) {
        var rdfXml, ontology, reasoner, RMethod = ReasoningEngine.incremental;

        rdfXml = fs.readFileSync(filepath).toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');
    
        ontology = JswParser.parse(rdfXml, function(err) {
            if(err) {
                throw err;
            }
        });

        reasoner = new JswReasoner.create(ontology, RMethod);

        if (!reasoner) {
            throw 'Error while classifying';
        } else {
            ClassificationData = {
                reasoner: reasoner,
                ontology: ontology
            };

            return ClassificationData;
        }
    },

    /**
     * Answers a SPARQL query against the reasoner instance
     * @param query The query text
     */
    query: function(query) {
        var sparql = JswSPARQL.sparql,
                results, RMethod = ReasoningEngine.incremental,
                parsedQuery = sparql.parse(query);

        if(!ClassificationData) {
            throw 'Reasoner not initialized!';
        } else {
            results = ClassificationData.reasoner.aBox.answerQuery(parsedQuery, ClassificationData.reasoner.resultOntology, OWL2RL.rules, RMethod);
            return {
                data : results                
            };
        }
    }    
};

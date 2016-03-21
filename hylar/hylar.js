/**
 * Created by Spadon on 02/10/2014.
 */

var fs = require('fs'),
    path = require('path');

var Hylar = require('./core/Hylar');

module.exports = {
    /**
     * Loads and classifies an ontology
     * @param filepath The full path of the owl file
     */
    classify: function(filepath) {
        var mimeType = mime.contentType(path.extname(filepath))
            .replace(/;.*/g, ''),
            rawOntology;

        fs.readFile(ontoDir + filename, function(err, data) {
            if(err) {
                console.error(err);
                throw err;
            } else {
                rawOntology = data.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');
                return Hylar.load(rawOntology, mimeType, req.param('reasoningMethod'))
                    .then(function() {
                        console.log('Ontology successfully loaded and classified.');
                        return true;
                    });
            };
        });
    },

    /**
     * Answers a SPARQL query against the reasoner instance
     * @param query The query text
     */
    query: function(query) {
        return Hylar.query(query, req.param('reasoningMethod'))
            .then(function(results) {
                return results;
            });
    }    
};

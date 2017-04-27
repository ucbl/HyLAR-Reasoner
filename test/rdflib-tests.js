var should = require('should'),
    fs = require('fs'),
    $rdf = require('rdflib');

var graph = $rdf.graph();

var showRes = function(res) {
    console.log(res.length);
};

describe('RDFLib tests', function () {
    it('should load an ontology', function () {
        var ontoStr = fs.readFileSync('./test/ontologies/family.jsonld');
        $rdf.parse(ontoStr, graph, "#default", 'application/ld+json');    
    });

    it('should process SPARQL', function () {
        var sparql = 'SELECT ?s WHERE { ?s ?p ?o }',
            q = $rdf.SPARQLToQuery(sparql, null, graph);
        
        graph.query(q, showRes, null, null);      
         
    });
});

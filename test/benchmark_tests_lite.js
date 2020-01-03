/**
 * Created by Spadon on 19/08/2015.
 */

var fs = require('fs');
var path = require('path');
var mime = require('mime-types');

var Logics = require('../hylar/core/Logics/Logics');
var OWL2RL = require('../hylar/core/OWL2RL');

var H = require('../hylar/hylar');
var owl, ontology, Hylar = new H();

var reasoningMethod = process.env.rm;
var triples = fs.readFileSync(path.resolve(__dirname + '/ontologies/University0_14.nt')).toString();
var baseOntoTxt = fs.readFileSync(path.resolve(__dirname + '/ontologies/univ-bench-base-onto.ttl')).toString();

var univ1 = baseOntoTxt + fs.readFileSync(path.resolve(__dirname + '/ontologies/University0_0.ttl')).toString();
var univ2 = baseOntoTxt + fs.readFileSync(path.resolve(__dirname + '/ontologies/University0_5.ttl')).toString();
var univ3 = baseOntoTxt + fs.readFileSync(path.resolve(__dirname + '/ontologies/University0_14.ttl')).toString();

Hylar.setRules(Rules.equality.concat(Rules.transitivityInverse, Rules.equivalence, Rules.subsumption));
//Hylar.setRules(OWL2RL.equality);
//Hylar.setRules(OWL2RL.equivalence);
//Hylar.setRules(OWL2RL.subsumption);
//Hylar.setRules(OWL2RL.transitivityInverse);

var date = new Date().getTime();
var query, results;

Hylar.quiet();

function delay() {
    console.log(new Date().getTime() - date);
    date = new Date().getTime(); 
}

function testSuite(univ, i, reasoningMethod) {
    console.log(reasoningMethod);
    console.log('CLASSIFICATION UNIV ' + i);
    Hylar.load(univ, 'text/turtle', false, false, reasoningMethod).then(function() {
        delay();
        console.log('INSERT UNIV ' + i);
        queryText = 'INSERT DATA { ' + triples + ' }';
        return Hylar.query(queryText);
    }).then(function() {
        delay();
        console.log('DELETE UNIV ' + i);
        queryText = 'DELETE DATA { ' + triples + ' }';
        return Hylar.query(queryText);
    }).then(function() {
        delay();
        console.log('REINSERT UNIV ' + i);
        queryText = 'INSERT DATA { ' + triples + ' }';
        return Hylar.query(queryText);
    }).then(function() {
        delay();
        console.log('SELECT UNIV ' + i);
        queryText = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX ub: <http://www.lehigh.edu/~zhp2/2004/0401/univ-bench.owl#> SELECT ?X ?Y ?Z WHERE {?X rdf:type ub:GraduateStudent . ?Y rdf:type ub:University . ?Z rdf:type ub:Department . ?X ub:memberOf ?Z . ?Z ub:subOrganizationOf ?Y . ?X ub:undergraduateDegreeFrom ?Y}';
        return Hylar.query(queryText);
    }).then(function() {
        delay();
        if ((reasoningMethod == 'incremental') && (i == 3)) {
            return testSuite(univ1, 1, 'tagBased');
        }   
        switch(i) {
            case 1:
                return testSuite(univ2, i+1, reasoningMethod);
            case 2:
                return testSuite(univ3, i+1, reasoningMethod);
            case 3:
                return true;
            default:
                return true;                
        }
    });
}

testSuite(univ1, 1, 'incremental');
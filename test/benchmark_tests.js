/**
 * Created by Spadon on 19/08/2015.
 */

var should = require('should');
var fs = require('fs');
var path = require('path');
var mime = require('mime-types');

var Logics = require('../hylar/core/Logics/Logics');
var OWL2RL = require('../hylar/core/OWL2RL');
var emitter = require('../hylar/core/Emitter');

var H = require('../hylar/hylar');
var owl, ontology, Hylar = new H();

var reasoningMethod = process.env.rm;
var triples = fs.readFileSync(path.resolve(__dirname + '/ontologies/University0_14.nt')).toString();
var baseOntoTxt = fs.readFileSync(path.resolve(__dirname + '/ontologies/univ-bench-base-onto.ttl')).toString();

var univ1 = baseOntoTxt + fs.readFileSync(path.resolve(__dirname + '/ontologies/University0_0.ttl')).toString();
var univ2 = baseOntoTxt + fs.readFileSync(path.resolve(__dirname + '/ontologies/University0_5.ttl')).toString();
var univ3 = baseOntoTxt + fs.readFileSync(path.resolve(__dirname + '/ontologies/University0_14.ttl')).toString();

/*var univ1 = baseOntoTxt + fs.readFileSync(path.resolve(__dirname + '/ontologies/University20-5k.ttl')).toString();
var univ2 = baseOntoTxt + fs.readFileSync(path.resolve(__dirname + '/ontologies/University20-20k.ttl')).toString();
var univ3 = baseOntoTxt + fs.readFileSync(path.resolve(__dirname + '/ontologies/University20-50k.ttl')).toString();*/

//univ1=univ3;
//univ1 += univ2 + univ3; //20k

Hylar.setRules(Rules.equality.concat(Rules.transitivityInverse, Rules.equivalence, Rules.subsumption));
//Hylar.setRules(OWL2RL.equivalence);
//Hylar.setRules(OWL2RL.equality);
//Hylar.setRules(OWL2RL.subsumption);
//Hylar.setRules(OWL2RL.transitivityInverse);

var date = new Date().getTime();
var firedRules;

emitter.on('rule-fired', function(rulename) {
    if (!firedRules[rulename]) {
        firedRules[rulename] = 0;
    }           
    firedRules[rulename]++;
});

function initFiredRules() {
    firedRules = {};    
}

function displayFiredRules() {
    console.log(JSON.stringify(firedRules, null, 4));
}
        

Hylar.quiet();

function delay() {
    /*var delay = new Date().getTime() - date;
    fs.appendFileSync('bench.txt', delay + '\n');
    console.log(delay);
    date = new Date().getTime();*/ 
}


describe('CLASSIFICATION UNIV 1', function () {
    it('should parse and classify the ontology', function () {
        initFiredRules();
        return Hylar.load(univ1, 'text/turtle', false, false, reasoningMethod)
        .then(function() {
            displayFiredRules();
            delay();
        });
    });
});

describe('INSERT UNIV 1', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'INSERT DATA { ' + triples + ' }';
        return Hylar.query(queryText).then(function() {
            delay();
        });
    });
});

describe('DELETE UNIV 1', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'DELETE DATA { ' + triples + ' }';
        return Hylar.query(queryText).then(function() {
            delay();
        });
    });
});

describe('REINSERT UNIV 1', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'INSERT DATA { ' + triples + ' }';
        return Hylar.query(queryText).then(function() {
            delay();
        });
    });
});

describe('SELECT', function () {
    var queryText = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX ub: <http://www.lehigh.edu/~zhp2/2004/0401/univ-bench.owl#> SELECT ?X ?Y ?Z WHERE {?X rdf:type ub:GraduateStudent . ?Y rdf:type ub:University . ?Z rdf:type ub:Department . ?X ub:memberOf ?Z . ?Z ub:subOrganizationOf ?Y . ?X ub:undergraduateDegreeFrom ?Y}';
    it('insert data and derivations', function () {
        return Hylar.query(queryText).then(function() {
            delay();
        });
    });
});

// ------------------------------------------------------------------------

describe('CLASSIFICATION UNIV 2', function () {
    it('should parse and classify the ontology', function () {
        return Hylar.load(univ2, 'text/turtle', false, false, reasoningMethod).then(function() {
            delay();
        });
    });
});

describe('INSERT UNIV 2', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'INSERT DATA { ' + triples + ' }';
        return Hylar.query(queryText).then(function() {
            delay();
        });
    });
});

describe('DELETE UNIV 2', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'DELETE DATA { ' + triples + ' }';
        return Hylar.query(queryText).then(function() {
            delay();
        });
    });
});

describe('REINSERT UNIV 2', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'INSERT DATA { ' + triples + ' }';
        return Hylar.query(queryText).then(function() {
            delay();
        });
    });
});

describe('SELECT', function () {
    var queryText = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX ub: <http://www.lehigh.edu/~zhp2/2004/0401/univ-bench.owl#> SELECT ?X ?Y ?Z WHERE {?X rdf:type ub:GraduateStudent . ?Y rdf:type ub:University . ?Z rdf:type ub:Department . ?X ub:memberOf ?Z . ?Z ub:subOrganizationOf ?Y . ?X ub:undergraduateDegreeFrom ?Y}';
    it('insert data and derivations', function () {
        return Hylar.query(queryText).then(function() {
            delay();
        });
    });
});

// ------------------------------------------------------------------------

describe('CLASSIFICATION UNIV 3', function () {
    it('should parse and classify the ontology', function () {
        return Hylar.load(univ3, 'text/turtle', false, false, reasoningMethod).then(function() {
            delay();
        });
    });
});


describe('INSERT UNIV 3', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'INSERT DATA { ' + triples + ' }';
        return Hylar.query(queryText).then(function() {
            delay();
        });
    });
});

describe('DELETE UNIV 3', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'DELETE DATA { ' + triples + ' }';
        return Hylar.query(queryText).then(function() {
            delay();
        });
    });
});

describe('REINSERT UNIV 3', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'INSERT DATA { ' + triples + ' }';
        return Hylar.query(queryText).then(function() {
            delay();
        });
    });
});

describe('SELECT', function () {
    var queryText = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX ub: <http://www.lehigh.edu/~zhp2/2004/0401/univ-bench.owl#> SELECT ?X ?Y ?Z WHERE {?X rdf:type ub:GraduateStudent . ?Y rdf:type ub:University . ?Z rdf:type ub:Department . ?X ub:memberOf ?Z . ?Z ub:subOrganizationOf ?Y . ?X ub:undergraduateDegreeFrom ?Y}';
    it('insert data and derivations', function () {
        return Hylar.query(queryText).then(function() {
            delay();
        });
    });
});

/**
 * Created by Spadon on 19/08/2015.
 */

var should = require('should');
var fs = require('fs');
var path = require('path');
var mime = require('mime-types');

var Logics = require('../hylar/core/Logics/Logics');

var H = require('../hylar/hylar');
var queries = require('./query-examples-200t');
var owl, ontology, mimeType, Hylar = new H();

var a, b, c;

var reasoningMethod = process.env.rm;
var triples = fs.readFileSync(path.resolve(__dirname + '/ontologies/University0_14.nt')).toString();
var baseOntoTxt = fs.readFileSync(path.resolve(__dirname + '/ontologies/univ-bench-base-onto.ttl')).toString();

var univ1 = baseOntoTxt + fs.readFileSync(path.resolve(__dirname + '/ontologies/University0_0.ttl')).toString();
var univ2 = baseOntoTxt + fs.readFileSync(path.resolve(__dirname + '/ontologies/University0_5.ttl')).toString();
var univ3 = baseOntoTxt + fs.readFileSync(path.resolve(__dirname + '/ontologies/University0_14.ttl')).toString();


describe('CLASSIFICATION UNIV 1', function () {
    it('should parse and classify the ontology', function () {
        return Hylar.load(univ1, 'text/turtle', reasoningMethod)
    });
});

describe('INSERT UNIV 1', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'INSERT DATA { ' + triples + ' }';
        return Hylar.query(queryText);
    });
});

describe('DELETE UNIV 1', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'DELETE DATA { ' + triples + ' }';
        return Hylar.query(queryText);
    });
});

describe('REINSERT UNIV 1', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'INSERT DATA { ' + triples + ' }';
        return Hylar.query(queryText);
    });
});

describe('SELECT', function () {
    var queryText = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX ub: <http://www.lehigh.edu/~zhp2/2004/0401/univ-bench.owl#> SELECT ?X ?Y ?Z WHERE {?X rdf:type ub:GraduateStudent . ?Y rdf:type ub:University . ?Z rdf:type ub:Department . ?X ub:memberOf ?Z . ?Z ub:subOrganizationOf ?Y . ?X ub:undergraduateDegreeFrom ?Y}';
    it('insert data and derivations', function () {
        return Hylar.query(queryText);
    });
});

// ------------------------------------------------------------------------

describe('CLASSIFICATION UNIV 2', function () {
    it('should parse and classify the ontology', function () {
        return Hylar.load(univ2, 'text/turtle', reasoningMethod)
    });
});


describe('INSERT UNIV 2', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'INSERT DATA { ' + triples + ' }';
        return Hylar.query(queryText);
    });
});

describe('DELETE UNIV 2', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'DELETE DATA { ' + triples + ' }';
        return Hylar.query(queryText);
    });
});

describe('REINSERT UNIV 2', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'INSERT DATA { ' + triples + ' }';
        return Hylar.query(queryText);
    });
});

// ------------------------------------------------------------------------

describe('CLASSIFICATION UNIV 3', function () {
    it('should parse and classify the ontology', function () {
        return Hylar.load(univ3, 'text/turtle', reasoningMethod)
    });
});


describe('INSERT UNIV 3', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'INSERT DATA { ' + triples + ' }';
        return Hylar.query(queryText);
    });
});

describe('DELETE UNIV 3', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'DELETE DATA { ' + triples + ' }';
        return Hylar.query(queryText);
    });
});

describe('REINSERT UNIV 3', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = 'INSERT DATA { ' + triples + ' }';
        return Hylar.query(queryText);
    });
});
/**
 * Created by Spadon on 19/08/2015.
 */

var fs = require('fs');
var path = require('path');

var Logics = require('../hylar/core/Logics/Logics');

var H = require('../hylar/hylar');
var owl, ontology, Hylar = new H();

var univ1 = fs.readFileSync(path.resolve(__dirname + '/ontologies/univ-bench-base-onto.ttl')).toString();
var triples = fs.readFileSync(path.resolve(__dirname + '/ontologies/University0_14.nt')).toString();

var insertQueryText = 'INSERT DATA { ' + triples + ' }';
var selectQueryText = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX ub: <http://www.lehigh.edu/~zhp2/2004/0401/univ-bench.owl#> SELECT ?X ?Y ?Z WHERE {?X rdf:type ub:GraduateStudent . ?Y rdf:type ub:University . ?Z rdf:type ub:Department . ?X ub:memberOf ?Z . ?Z ub:subOrganizationOf ?Y . ?X ub:undergraduateDegreeFrom ?Y}';
var addedRules = fs.readFileSync(path.resolve(__dirname + '/rules/rules.json')).toString();
var totalRules = [];
var queries10 = require('./query-examples');
var queries100 = require('./query-examples-100t');

Hylar.addRules(Logics.parseRules(JSON.parse(addedRules)));
totalRules = Hylar.rules;

describe('Preliminary insertion', function () {
    it('classifies', function () {
        return Hylar.load(univ1, 'text/turtle');
    });
});

describe('1 rule 1k triples', function () {
    it('INSERT', function () {
        Hylar.setRules([totalRules[0]]);
        return Hylar.query(insertQueryText)
    });
    it('SELECT', function () {
        return Hylar.query(selectQueryText)
    });
});

describe('10 rules 1k triples', function () {
    it('INSERT', function () {
        Hylar.setRules(totalRules.slice(0,10));
        return Hylar.query(insertQueryText)
    });
    it('SELECT', function () {
        return Hylar.query(selectQueryText)
    });
});

describe('100 rules 1k triples', function () {
    it('INSERT', function () {
        Hylar.setRules(totalRules);
        return Hylar.query(insertQueryText)
    });
    it('SELECT', function () {
        return Hylar.query(selectQueryText)
    });
});

//

describe('100 rules 10 triples', function () {
    it('INSERT', function () {
        return Hylar.query(queries10.fipaInsert)
    });
    it('SELECT', function () {
        return Hylar.query(selectQueryText)
    });
});

describe('100 rules 100 triples', function () {
    it('INSERT', function () {
        return Hylar.query(queries100.fipaInsert)
    });
    it('SELECT', function () {
        return Hylar.query(selectQueryText)
    });
});
/**
 * Created by Spadon on 19/08/2015.
 */

var should = require('should');
var fs = require('fs');
var path = require('path')

var Logics = require('../server/hylar/Logics/Logics');

var Hylar = require('../server/hylar/Hylar');
var queries = require('./query-examples-60t');
var owl, ontology, fipa = '/../server/ontologies/fipa.xml', asawoo = '/../server/ontologies/fipa.xml';

var a, b, c;

Hylar.setTagBased();

describe('File access', function () {
    it('should access the file', function () {
        var exists = fs.existsSync(path.resolve(__dirname + asawoo));
        exists.should.equal(true);
    });
});

describe('File reading', function () {
    it('should correctly read the file', function () {
        var data = fs.readFileSync(path.resolve(__dirname + asawoo));
        data.should.exist;
        owl = data.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');
    });
});

describe('Ontology Parsing and classification', function () {
    it('should parse and classify the ontology', function () {
        return Hylar.load(owl, 'application/rdf+xml')
        .then(function() {
            return Hylar.query(
                'CONSTRUCT { ?a ?b ?c } WHERE { ?a ?b ?c }');
        })
        .then(function(r) {
            before = r.length;
            b=r;
            r.length.should.be.above(280);
        });
    });
});


describe('INSERT query with derivations', function () {
    var query, results;
    it('insert data and derivations', function () {
        var queryText = queries.fipaInsert;
        return Hylar.query(queryText)
            .then(function(i) {
                i.should.be.true;
                return Hylar.query(
                    'CONSTRUCT { ?a ?b ?c } WHERE { ?a ?b ?c }');
            })
            .then(function(r) {
                r.length.should.be.above(before);
                bIns = r.length;
            });

    });
});

describe('SELECT query with derivations', function () {
    var query, results;
    it('should find a class assertion', function () {
        // ClassAssertion Test
        return Hylar.query(
                'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
                'PREFIX fipa: <http://sites.google.com/site/smartappliancesproject/ontologies/fipa#> ' +
                'SELECT * { ?a rdf:type fipa:Device . } ')
            .then(function(r) {
                r.length.should.equal(1);
            });
    });

    it('should find another class assertion', function () {
        // Multiple ClassAssertion Test
        return Hylar.query(
                'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
                'PREFIX fipa: <http://sites.google.com/site/smartappliancesproject/ontologies/fipa#> ' +
                'SELECT * { ?a rdf:type fipa:ConnectionDescription . } ')
            .then(function(r) {
                r.length.should.equal(4);
            });
    });

    it('should find an objectProperty assertion', function () {
        // ObjectProperty Test
        return Hylar.query(
                'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
                'PREFIX fipa: <http://sites.google.com/site/smartappliancesproject/ontologies/fipa#> ' +
                'SELECT * { ?a fipa:hasConnection fipa:Wifi . } ')
            .then(function(r) {
                r.length.should.equal(1);
            });
    });

    it('should find a dataProperty assertion', function () {
        // DataProperty Test
        return Hylar.query(
                'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
                'PREFIX fipa: <http://sites.google.com/site/smartappliancesproject/ontologies/fipa#> ' +
                'SELECT * { fipa:Inspiron fipa:hasName ?a . } ')
            .then(function(r) {
                r.length.should.equal(1);
            });
    });

    it('should find a subsumed class assertion', function () {
        // Subsumption test
        return Hylar.query(
                'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
                'PREFIX fipa: <http://sites.google.com/site/smartappliancesproject/ontologies/fipa#> ' +
                'SELECT * { ?a rdf:type fipa:Function . } ')
            .then(function(r) {
                r.length.should.equal(1);
            });
    });

});

describe('DELETE query with subsumption', function () {
    var query;
    it('should delete including derivations', function () {
        var queryText = queries.fipaDelete;
        return Hylar.query(queryText)
            .then(function(i) {
                i.should.be.true;
                return Hylar.query(
                    'CONSTRUCT { ?a ?b ?c } WHERE { ?a ?b ?c }');
            })
            .then(function(r) {
                Logics;
                r.length.should.be.exactly(before);
            });
    });
});

describe('DELETIONS checking', function () {
    var query, results;
    it('should find nothing', function () {
        // ClassAssertion Test
        return Hylar.query(
                'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
                'PREFIX fipa: <http://sites.google.com/site/smartappliancesproject/ontologies/fipa#> ' +
                'SELECT * WHERE { ?a rdf:type fipa:Device . } ')
            .then(function(r) {
                r.length.should.equal(0);
            });
    });

    it('should find nothing', function () {
        // Multiple ClassAssertion Test
        return Hylar.query(
                'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
                'PREFIX fipa: <http://sites.google.com/site/smartappliancesproject/ontologies/fipa#> ' +
                'SELECT * { ?a rdf:type fipa:ConnectionDescription . } ')
            .then(function(r) {
                r.length.should.equal(0);
            });
    });

    it('should find nothing', function () {
        // ObjectProperty Test
        return Hylar.query(
                'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
                'PREFIX fipa: <http://sites.google.com/site/smartappliancesproject/ontologies/fipa#> ' +
                'SELECT * { ?a fipa:hasConnection fipa:Wifi . } ')
            .then(function(r) {
                r.length.should.equal(0);
            });
    });

    it('should find nothing', function () {
        // DataProperty Test
        return Hylar.query(
                'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
                'PREFIX fipa: <http://sites.google.com/site/smartappliancesproject/ontologies/fipa#> ' +
                'SELECT * { fipa:Inspiron fipa:hasName ?a . } ')
            .then(function(r) {
                r.length.should.equal(0);
            });
    });

    it('should find nothing', function () {
        // Subsumption test
        return Hylar.query(
                'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
                'PREFIX fipa: <http://sites.google.com/site/smartappliancesproject/ontologies/fipa#> ' +
                'SELECT ?a { ?a rdf:type fipa:Function . }')
            .then(function(r) {
                r.length.should.equal(0);
            });
    });

});

describe('Re-INSERT exact same query', function () {
    var query;
    it('should not change anything (insert)', function () {
        var queryText = queries.fipaInsert;
        return Hylar.query(queryText)
            .then(function(i) {
                i.should.be.true;
                return Hylar.query(
                    'CONSTRUCT { ?a ?b ?c } WHERE { ?a ?b ?c }');
            })
            .then(function(r) {
                r.length.should.be.exactly(bIns);
            });
    });
});

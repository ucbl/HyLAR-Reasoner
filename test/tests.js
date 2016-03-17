/**
 * Created by Spadon on 19/08/2015.
 */

var should = require('should');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var JswParser = require('../hylar/core/JswParser');
var JswOWL = require('../hylar/core/JswOWL');
var JswRDF = require('../hylar/core/JswRDF');
var Reasoner = require('../hylar/core/Reasoner');
var JswSPARQL = require('../hylar/core/JswSPARQL');

var Logics = require('../hylar/core/Logics/Logics');
var Utils = require('../hylar/core/Utils');
var ReasoningEngine = require('../hylar/core/ReasoningEngine');

var owl, ontology, reasoner, filepath = '/ontologies/fipa.owl';

var before, after, bIns, ts;

describe('File access', function () {
    it('should access the file', function () {
        var exists = fs.existsSync(path.resolve(__dirname + filepath));
        exists.should.equal(true);
    });
});

describe('File reading', function () {
    it('should correctly read the file', function () {
        var data = fs.readFileSync(path.resolve(__dirname + filepath));
        data.should.exist;
        owl = data.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');
    });
});

describe('Ontology Parsing', function () {
    it('should parse the ontology', function () {
        ts = new Date().getTime();
        ontology = JswParser.parse(owl, function (err) {
            console.error(err);
        });
        ontology.should.exist;
        console.log((new Date().getTime() - ts) + ' ms ');
    });
});

describe('[I] Ontology Classification', function () {
    it('should classify the ontology', function () {
        ts = new Date().getTime();
        reasoner = Reasoner.create(ontology, ReasoningEngine.incremental);
        reasoner.should.exist;
        before = reasoner.aBox.convertAssertions().length;
        console.log((new Date().getTime() - ts) + ' ms ');
    });

    it('should convert axioms ', function () {
        var formalAxioms  = reasoner.resultOntology.convertAxioms ();
        formalAxioms .length.should.be.above(0);
    });
});

describe('[I] INSERT query with subsumption', function () {
    var query, results;
    it('should parse the INSERT statement and infer data', function () {
        ts = new Date().getTime();
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'INSERT DATA { ' +
        '<#Inspiron> rdf:type <#Device> . ' +
        //'<#nspiron> rdf:type <#Device> . ' +
        //'<#spiron> rdf:type <#Device> . ' +
        //'<#piron> rdf:type <#Device> . ' +
        //'<#iron> rdf:type <#Device> . ' +
        //'<#ron> rdf:type <#Device> . ' +
        //'<#on> rdf:type <#Device> . ' +
        //'<#n> rdf:type <#Device> . ' +
        '<#Inspiron> <#hasConnection> <#Wifi> . ' +
        //'<#nspiron> <#hasConnection> <#Ethernet100mbps> . ' +
        //'<#ron> <#hasConnection> <#Bluetooth> . ' +
        '<#Request1> rdf:type <#RequestDeviceInfo> . ' +
        //'<#equest1> rdf:type <#RequestDeviceInfo> . ' +
        //'<#quest1> rdf:type <#RequestDeviceInfo> . ' +
        //'<#uest1> rdf:type <#RequestDeviceInfo> . ' +
        //'<#est1> rdf:type <#RequestDeviceInfo> . ' +
        //'<#st1> rdf:type <#RequestDeviceInfo> . ' +
        //'<#t1> rdf:type <#RequestDeviceInfo> . ' +
        //'<#1> rdf:type <#RequestDeviceInfo> . ' +
        //'<#> rdf:type <#RequestDeviceInfo> . ' +
        '<#Inspiron> <#hasName> "Dell Inspiron 15R" . ' +
        //'<#nspiron> <#hasName> "Dell Inspiron 15" . ' +
        //'<#spiron> <#hasName> "Dell Inspiron 1" . ' +
        //'<#piron> <#hasName> "Dell Inspiron " . ' +
        //'<#iron> <#hasName> "Dell Inspiron" . ' +
        //'<#ron> <#hasName> "Dell Inspiro" . ' +
        //'<#on> <#hasName> "Dell Inspir" . ' +
        //'<#n> <#hasName> "Dell Inspi" . ' +
        '<#Wifi> rdf:type <#ConnectionDescription> . ' +
        '<#Bluetooth> rdf:type <#ConnectionDescription> . ' +
        '<#Zigbee> rdf:type <#ConnectionDescription> . ' +
        '<#Ethernet100mbps> rdf:type <#ConnectionDescription> . ' +
        '}');
        query.should.exist;
        results = reasoner.answerQuery(query, ReasoningEngine.incremental);
        console.log((new Date().getTime() - ts) + ' ms ');
    });
});

describe('INSERT query into graph', function () {
    var query, results;
    it('should parse the INSERT statement and infer data', function () {
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'INSERT DATA { ' +
            'GRAPH <http://liris.cnrs.fr/asawoo/devices/> { ' +
                '<#NokiaLumia> rdf:type <#Device> . ' +
                '<#NokiaLumia> <#hasConnection> <#Bluetooth> . ' +
                '<#NokiaLumia> <#hasName> "Nokia Lumia 635" . ' +
            '} ' +
            'GRAPH <http://liris.cnrs.fr/asawoo/other/> { ' +
                '<#Request23> rdf:type <#RequestDeviceInfo> ' +
            '} ' +
        '}');
        query.should.exist;
        results = reasoner.answerQuery(query, ReasoningEngine.incremental);
    });
});

describe('SELECT query using named graphs', function () {
    var query, results;
    it('should find 2 devices', function () {
        // ClassAssertion Test
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'SELECT ?a { ?a rdf:type <#Device> . }');
        query.should.exist;
        results = reasoner.answerQuery(query);
        _.findIndex(results[0], {'a': '#Inspiron'}).should.be.above(-1);
        _.findIndex(results[0], {'a': '#NokiaLumia'}).should.be.above(-1);
    });

    it('should only find the nokia', function () {
        // ClassAssertion Test
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'SELECT ?a FROM NAMED <http://liris.cnrs.fr/asawoo/devices/> { ?a rdf:type <#Device> . }');
        query.should.exist;
        results = reasoner.answerQuery(query);
        _.findIndex(results[0], {'a': '#Inspiron'}).should.eql(-1);
        _.findIndex(results[0], {'a': '#NokiaLumia'}).should.be.above(-1);
    });

    it('should only find the nokia (again)', function () {
        // ClassAssertion Test
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'SELECT ?a ' +
        'FROM NAMED <http://liris.cnrs.fr/asawoo/other/> ' +
        'FROM NAMED <http://liris.cnrs.fr/asawoo/devices/> ' +
        '{ ?a rdf:type <#Device> . }');
        query.should.exist;
        results = reasoner.answerQuery(query);
        _.findIndex(results[0], {'a': '#Inspiron'}).should.eql(-1);
        _.findIndex(results[0], {'a': '#NokiaLumia'}).should.be.above(-1);
    });

    it('should find nothing', function () {
        // ClassAssertion Test
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'SELECT ?a FROM NAMED <http://liris.cnrs.fr/asawoo/other/> { ?a rdf:type <#Device> . }');
        query.should.exist;
        results = reasoner.answerQuery(query);
        _.findIndex(results[0], {'a': '#Inspiron'}).should.eql(-1);
        _.findIndex(results[0], {'a': '#NokiaLumia'}).should.eql(-1);
    });

    it('should only find the request23', function () {
        // ClassAssertion Test
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'SELECT ?a FROM NAMED <http://liris.cnrs.fr/asawoo/other/> { ?a rdf:type <#RequestDeviceInfo> . }');
        query.should.exist;
        results = reasoner.answerQuery(query);
        _.findIndex(results[0], {'a': '#Request23'}).should.be.above(-1);
        _.findIndex(results[0], {'a': '#Request1'}).should.eql(-1);
    });
});

describe('SELECT query with subsumption', function () {
    var query, results;
    it('should find a class assertion', function () {
        // ClassAssertion Test
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'SELECT ?a { ?a rdf:type <#Device> . }');
        query.should.exist;
        results = reasoner.answerQuery(query);
        _.findIndex(results[0], {'a': '#Inspiron'}).should.be.above(-1);
    });

    it('should find another class assertion', function () {
        // Multiple ClassAssertion Test
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'SELECT ?a { ?a rdf:type <#ConnectionDescription> . }');
        query.should.exist;
        results = reasoner.answerQuery(query);
        _.findIndex(results[0], {'a': '#Wifi'}).should.be.above(-1);
    });

    it('should find an objectProperty assertion', function () {
        // ObjectProperty Test
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'SELECT ?a { ?a <#hasConnection> <#Wifi> . }');
        query.should.exist;
        results = reasoner.answerQuery(query);
        _.findIndex(results[0], {'a': '#Inspiron'}).should.be.above(-1);
    });

    it('should find a dataProperty assertion', function () {
        // DataProperty Test
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'SELECT ?a { <#Inspiron> <#hasName> ?a . }');
        query.should.exist;
        results = reasoner.answerQuery(query);
        _.findIndex(results[0], {'a': '"Dell Inspiron 15R"'}).should.be.above(-1);
    });

    it('should find a subsumed class assertion', function () {
        // Subsumption test
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'SELECT ?a { ?a rdf:type <#Function> . }');
        query.should.exist;
        results = reasoner.answerQuery(query);
        _.findIndex(results[0], {'a': '#Request1'}).should.be.above(-1);

    });

    it('should find a dataProperty with two variables', function () {
        // DataProperty with two variables test
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'SELECT ?a ?b { ?a <#hasName> ?b . }');
        query.should.exist;
        results = reasoner.answerQuery(query);
        _.findIndex(results[0], {'a': '#Inspiron'}).should.be.above(-1);
        _.findIndex(results[0], {'b': '"Dell Inspiron 15R"'}).should.be.above(-1);
    });

});

describe('DELETE graph data', function () {
    var query, results;
    it('should parse the DELETE statement and infer data', function () {
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'DELETE DATA { ' +
        'GRAPH <http://liris.cnrs.fr/asawoo/devices/> { ' +
        '<#NokiaLumia> rdf:type <#Device> . ' +
        '<#NokiaLumia> <#hasConnection> <#Bluetooth> . ' +
        '<#NokiaLumia> <#hasName> "Nokia Lumia 635" . ' +
        '} ' +
        'GRAPH <http://liris.cnrs.fr/asawoo/other/> { ' +
        '<#Request23> rdf:type <#RequestDeviceInfo> ' +
        '} ' +
        '}');
        query.should.exist;
        results = reasoner.answerQuery(query, ReasoningEngine.incremental);
    });
});


describe('[I] Re-INSERT exact same query', function () {
    var query;
    it('should not change anything (insert)', function () {
        ts = new Date().getTime();
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'INSERT DATA { ' +
        '<#Inspiron> rdf:type <#Device> . ' +
            //'<#nspiron> rdf:type <#Device> . ' +
            //'<#spiron> rdf:type <#Device> . ' +
            //'<#piron> rdf:type <#Device> . ' +
            //'<#iron> rdf:type <#Device> . ' +
            //'<#ron> rdf:type <#Device> . ' +
            //'<#on> rdf:type <#Device> . ' +
            //'<#n> rdf:type <#Device> . ' +
        '<#Inspiron> <#hasConnection> <#Wifi> . ' +
            //'<#nspiron> <#hasConnection> <#Ethernet100mbps> . ' +
            //'<#ron> <#hasConnection> <#Bluetooth> . ' +
        '<#Request1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#equest1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#quest1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#uest1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#est1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#st1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#t1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#> rdf:type <#RequestDeviceInfo> . ' +
        '<#Inspiron> <#hasName> "Dell Inspiron 15R" . ' +
            //'<#nspiron> <#hasName> "Dell Inspiron 15" . ' +
            //'<#spiron> <#hasName> "Dell Inspiron 1" . ' +
            //'<#piron> <#hasName> "Dell Inspiron " . ' +
            //'<#iron> <#hasName> "Dell Inspiron" . ' +
            //'<#ron> <#hasName> "Dell Inspiro" . ' +
            //'<#on> <#hasName> "Dell Inspir" . ' +
            //'<#n> <#hasName> "Dell Inspi" . ' +
        '<#Wifi> rdf:type <#ConnectionDescription> . ' +
        '<#Bluetooth> rdf:type <#ConnectionDescription> . ' +
        '<#Zigbee> rdf:type <#ConnectionDescription> . ' +
        '<#Ethernet100mbps> rdf:type <#ConnectionDescription> . ' +
        '}');
        query.should.exist;
        bIns = reasoner.aBox.convertAssertions().length;
        reasoner.answerQuery(query, ReasoningEngine.incremental);
        console.log((new Date().getTime() - ts) + ' ms ');
        reasoner.aBox.convertAssertions().length.should.eql(bIns);
    });
});

describe('[I] DELETE query with subsumption', function () {
    var query, results;
    it('should DELETE with subsumptions', function () {
        ts = new Date().getTime();
        query = JswSPARQL.sparql.parse('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
        'DELETE DATA { ' +
        '<#Inspiron> rdf:type <#Device> . ' +
            //'<#nspiron> rdf:type <#Device> . ' +
            //'<#spiron> rdf:type <#Device> . ' +
            //'<#piron> rdf:type <#Device> . ' +
            //'<#iron> rdf:type <#Device> . ' +
            //'<#ron> rdf:type <#Device> . ' +
            //'<#on> rdf:type <#Device> . ' +
            //'<#n> rdf:type <#Device> . ' +
        '<#Inspiron> <#hasConnection> <#Wifi> . ' +
            //'<#nspiron> <#hasConnection> <#Ethernet100mbps> . ' +
            //'<#ron> <#hasConnection> <#Bluetooth> . ' +
        '<#Request1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#equest1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#quest1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#uest1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#est1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#st1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#t1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#1> rdf:type <#RequestDeviceInfo> . ' +
            //'<#> rdf:type <#RequestDeviceInfo> . ' +
        '<#Inspiron> <#hasName> "Dell Inspiron 15R" . ' +
            //'<#nspiron> <#hasName> "Dell Inspiron 15" . ' +
            //'<#spiron> <#hasName> "Dell Inspiron 1" . ' +
            //'<#piron> <#hasName> "Dell Inspiron " . ' +
            //'<#iron> <#hasName> "Dell Inspiron" . ' +
            //'<#ron> <#hasName> "Dell Inspiro" . ' +
            //'<#on> <#hasName> "Dell Inspir" . ' +
            //'<#n> <#hasName> "Dell Inspi" . ' +
        '<#Wifi> rdf:type <#ConnectionDescription> . ' +
        '<#Bluetooth> rdf:type <#ConnectionDescription> . ' +
        '<#Zigbee> rdf:type <#ConnectionDescription> . ' +
        '<#Ethernet100mbps> rdf:type <#ConnectionDescription> . ' +
        '}');
        query.should.exist;
        results = reasoner.answerQuery(query, ReasoningEngine.incremental);
        console.log((new Date().getTime() - ts) + ' ms ');
        after = reasoner.aBox.convertAssertions().length;
        after.should.eql(before);
    });
});
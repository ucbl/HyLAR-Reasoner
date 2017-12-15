/**
 * Created by MT on 17/09/2015.
 */

/**
 * Partial OWL2RL spec from http://www.w3.org/TR/owl2-profiles
 * @author Mehdi Terdjimi
 * @type {{rules: *[]}}
 */

var Rule = require('./Logics/Rule'),
    Fact = require('./Logics/Fact'),
    Prefixes = require('./Prefixes'),
    Logics = require('./Logics/Logics');

var Class = Prefixes.OWL + 'Class',
    EquivalentClass = Prefixes.OWL + 'equivalentClass',
    EquivalentProperty = Prefixes.OWL + 'equivalentProperty',
    Thing = Prefixes.OWL + 'Thing',
    Nothing = Prefixes.OWL + 'Nothing',
    Type = Prefixes.RDF + 'type',
    Subject = Prefixes.RDF + 'subject',
    Predicate = Prefixes.RDF + 'predicate',
    Object = Prefixes.RDF + 'object',
    SubClassOf = Prefixes.RDFS + 'subClassOf',
    SubPropertyOf = Prefixes.RDFS + 'subPropertyOf',
    TransitiveProperty = Prefixes.OWL + 'TransitiveProperty',
    InverseOf = Prefixes.OWL + 'inverseOf',
    SameAs = Prefixes.OWL + 'sameAs',
    Domain = Prefixes.RDFS + "domain",
    Range = Prefixes.RDFS + "range";

/**
 * RDFS/OWL entailment rules.
 * @type {{rules: {classSubsumption: *[], propertySubsumption: *[], transitivity: *[], inverse: *[], equivalence: *[], equality: *[]}}}
 */

OWL2RL = {
    rules: {
        classSubsumption: [
            // scm-sco
            new Rule([
                    new Fact(SubClassOf, '?c1', '?c2', [], true),
                    new Fact(SubClassOf, '?c2', '?c3', [], true)],
                [new Fact(SubClassOf, '?c1', '?c3', [], true)], "Class-Subsumption-1"),

            // cax-sco
            new Rule([
                    new Fact(SubClassOf, '?c1', '?c2', [], true),
                    new Fact(Type, '?x', '?c1', [], true)],
                [new Fact(Type, '?x', '?c2', [], true)], "Class-Subsumption-2")
        ],

        propertySubsumption: [
            // scm-spo
            new Rule([
                    new Fact(SubPropertyOf, '?p1', '?p2', [], true),
                    new Fact(SubPropertyOf, '?p2', '?p3', [], true)],
                [new Fact(SubPropertyOf, '?p1', '?p3', [], true)], "Property-Subsumption-1"),

            // prp-spo1
            new Rule([
                    new Fact(SubPropertyOf, '?p1', '?p2', [], true),
                    new Fact('?p1', '?x', '?y', [], true)],
                [new Fact('?p2', '?x', '?y', [], true)], "Property-Subsumption-2")
        ],

        transitivity: [
            // prp-trp
            new Rule([
                    new Fact('?p', '?x', '?y', [], true),
                    new Fact(Type, '?p', TransitiveProperty, [], true),
                    new Fact('?p', '?y', '?z', [], true)],
                [new Fact('?p', '?x', '?z', [], true)], "Property-Transitivity")
        ],

        inverse: [
            //prp-inv1
            new Rule([
                    new Fact(InverseOf, '?p1', '?p2', [], true),
                    new Fact('?p1', '?x', '?y', [], true)],
                [new Fact('?p2', '?y', '?x', [], true)], "Property-Inverse-1"),

            //prp-inv2
            new Rule([
                    new Fact(InverseOf, '?p1', '?p2', [], true),
                    new Fact('?p2', '?x', '?y', [], true)],
                [new Fact('?p1', '?y', '?x', [], true)], "Property-Inverse-2")
        ],

        equivalence: [
            //cax-eqc1
            new Rule([
                    new Fact(EquivalentClass, '?c1', '?c2', [], true),
                    new Fact(Type, '?x', '?c1', [], true)],
                [new Fact(Type, '?x', '?c2', [], true)], "Class-Equivalence-1"),

            //cax-eqc2
            new Rule([
                    new Fact(EquivalentClass, '?c1', '?c2', [], true),
                    new Fact(Type, '?x', '?c2', [], true)],
                [new Fact(Type, '?x', '?c1', [], true)], "Class-Equivalence-2"),

            //prp-eqp1
            new Rule([
                    new Fact(EquivalentProperty, '?p1', '?p2', [], true),
                    new Fact('?p1', '?x', 'y', [], true)],
                [new Fact('?p2', '?x', '?y', [], true)], "Property-Equivalence-1"),

            //prp-eqp2
            new Rule([
                    new Fact(EquivalentProperty, '?p1', '?p2', [], true),
                    new Fact('?p2', '?x', 'y', [], true)],
                [new Fact('?p1', '?x', '?y', [], true)], "Property-Equivalence-2")
        ],

        equality: [
            //eq-rep-s
            new Rule([
                    new Fact(SameAs, '?s1', '?s2', [], true),
                    new Fact('?p', '?s1', '?o', [], true)],
                [new Fact('?p', '?s2', '?o', [], true)], "Equality-1"),

            //eq-rep-p
            new Rule([
                    new Fact(SameAs, '?p1', '?p2', [], true),
                    new Fact('?p1', '?s', '?o', [], true)],
                [new Fact('?p2', '?s', '?o', [], true)], "Equality-2"),

            //eq-rep-o
            new Rule([
                    new Fact(SameAs, '?o1', '?o2', [], true),
                    new Fact('?p', '?s', '?o1', [], true)],
                [new Fact('?p', '?s', '?o2', [], true)], "Equality-3"),

            //eq-trans
            new Rule([
                    new Fact(SameAs, '?x', '?y', [], true),
                    new Fact(SameAs, '?y', '?z', [], true)],
                [new Fact(SameAs, '?x', '?z', [], true)], "Equality-4")

        ],

        domainRange: [
            //prp-dom
            new Rule([
                    new Fact(Domain, '?p', '?c', [], true),
                    new Fact('?p', '?x', '?y', [], true)],
                [new Fact(Type, '?x', '?c', [], true)], "Domain-ClassAssertion"),
            //prp-rng
            new Rule([
                    new Fact(Range, '?p', '?c', [], true),
                    new Fact('?p', '?x', '?y', [], true)],
                [new Fact(Type, '?y', '?c', [], true)], "Range-ClassAssertion"),
                
            new Rule([
                    new Fact(Domain, '?p', '?c1', [], true),
                    new Fact(SubClassOf, '?c1', '?c2', [], true)],
                [new Fact(Domain, '?p', '?c2', [], true)], "Domain-ClassSubsumption"),
            
            new Rule([
                    new Fact(Domain, '?p2', '?c', [], true),
                    new Fact(SubPropertyOf, '?p1', '?p2', [], true)],
                [new Fact(Domain, '?p1', '?c', [], true)], "Domain-PropertySubsumption"),

            new Rule([
                    new Fact(Range, '?p', '?c1', [], true),
                    new Fact(SubClassOf, '?c1', '?c2', [], true)],
                [new Fact(Range, '?p', '?c2', [], true)], "Range-ClassSubsumption"),
            
            new Rule([
                    new Fact(Range, '?p2', '?c', [], true),
                    new Fact(SubPropertyOf, '?p1', '?p2', [], true)],
                [new Fact(Range, '?p1', '?c', [], true)], "Range-PropertySubsumption")
        
        ],

        testsFipa: [
            new Rule([
                new Fact(Type, '?x', 'http://sites.google.com/site/smartappliancesproject/ontologies/fipa#Function', [], true),
                new Fact(Type, '?x', 'http://sites.google.com/site/smartappliancesproject/ontologies/fipa#RequestDeviceInfo', [], true)
            ], [
                new Fact(Type, '?x', Thing, [], true)
            ], "Propagation-Test-1"),

            new Rule([
                new Fact(Type, '?x', Thing, [], true)
            ], [
                new Fact('FALSE')
            ], "Inconsitency-Test"),

            new Rule([
                new Fact(Type, '?x', 'http://sites.google.com/site/smartappliancesproject/ontologies/fipa#Function', [], true)
            ], [
                new Fact(Type, '?x', 'http://sites.google.com/site/smartappliancesproject/ontologies/fipa#RequestDeviceInfo', [], true)
            ])
        ],

        testsBNode: [
            new Rule([
                new Fact(Type, '?x', 'http://sites.google.com/site/smartappliancesproject/ontologies/fipa#Function', [], true)
            ], [
                new Fact(Subject, '__bnode__1', '?x', [], true),
                new Fact(Predicate, '__bnode__1', Type, [], true),
                new Fact(Object, '__bnode__1', 'http://sites.google.com/site/smartappliancesproject/ontologies/fipa#Function', [], true)
            ], "BNode-Test")
        ]

    }
};

module.exports = {
    test:OWL2RL.rules.classSubsumption
        .concat(OWL2RL.rules.propertySubsumption)
        .concat(OWL2RL.rules.transitivity)
        .concat(OWL2RL.rules.inverse)
        .concat(OWL2RL.rules.equivalence)
        .concat(OWL2RL.rules.equality)
        .concat(OWL2RL.rules.domainRange).concat(OWL2RL.rules.testsFipa)
        .concat(Logics.parseRules([
            "(?x ?p1 ?y) ^ (?p2 http://www.w3.org/2002/07/owl#propertyChainAxiom ?n) ^ (?n http://www.w3.org/1999/02/22-rdf-syntax-ns#first ?p1) ^ (?n http://www.w3.org/1999/02/22-rdf-syntax-ns#rest ?n2) ^ (?n2 http://www.w3.org/1999/02/22-rdf-syntax-ns#first ?p2) ^ (?y ?p2 ?z) -> (?x ?p2 ?z)"
        ]))
        /*.concat(Logics.parseRules([
            "(?x http://www.w3.org/2002/07/owl#sameAs ?y) -> (?y http://www.w3.org/2002/07/owl#sameAs ?x)",
            "(?x http://www.w3.org/2002/07/owl#sameAs ?y) ^ (?y http://www.w3.org/2002/07/owl#sameAs ?z) -> (?x http://www.w3.org/2002/07/owl#sameAs ?z)",            
            "(?p http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#FunctionalProperty) ^ (?x ?p ?y1) ^ (?x ?p ?y2)	-> (?y1 http://www.w3.org/2002/07/owl#sameAs ?y2)",
            "(?p http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#InverseFunctionalProperty) ^ (?x1 ?p ?y) ^ (?x2 ?p ?y) -> (?x1 http://www.w3.org/2002/07/owl#sameAs ?x2)",
            "(?p http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#SymmetricProperty) ^ (?x ?p ?y) -> (?y ?p ?x)",
            "(?p http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#TransitiveProperty) ^ (?x ?p ?y) ^ (?y ?p ?z) -> (?x ?p ?z)",
            "(?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) ^ (?x ?p1 ?y) -> (?x ?p2 ?y)",
            "(?x http://www.w3.org/2002/07/owl#someValuesFrom ?y) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?u ?p ?v) ^ (?v http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?y) -> (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x)",
            "(?x http://www.w3.org/2002/07/owl#someValuesFrom http://www.w3.org/2002/07/owl#Thing) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?u ?p ?v)	-> (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x)",
            "(?x http://www.w3.org/2002/07/owl#allValuesFrom ?y) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x) ^ (?u ?p ?v)	-> (?v http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?y)",
            "(?x http://www.w3.org/2002/07/owl#hasValue ?y) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x)	-> (?u ?p ?y)",
            "(?x http://www.w3.org/2002/07/owl#hasValue ?y) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?u ?p ?y) -> (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x)",
            "(?c http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#Class) -> (?c http://www.w3.org/2000/01/rdf-schema#subClassOf ?c) ^ (?c http://www.w3.org/2002/07/owl#equivalentClass ?c) ^ (?c http://www.w3.org/2000/01/rdf-schema#subClassOf http://www.w3.org/2002/07/owl#Thing) ^ (http://www.w3.org/2002/07/owl#Nothing http://www.w3.org/2000/01/rdf-schema#subClassOf ?c)",
            "(?c1 http://www.w3.org/2002/07/owl#equivalentClass ?c2) -> (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2) ^ (?c2 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c1)",
            "(?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2) ^ (?c2 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c1) -> (?c1 http://www.w3.org/2002/07/owl#equivalentClass ?c2)",
            "(?p http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#ObjectProperty) -> (?p http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p) ^ (?p http://www.w3.org/2002/07/owl#equivalentProperty ?p)",
            "(?p http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#DatatypeProperty) -> (?p http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p) ^ (?p http://www.w3.org/2002/07/owl#equivalentProperty ?p)",
            "(?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) ^ (?p2 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p3) -> (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p3)",
            "(?p1 http://www.w3.org/2002/07/owl#equivalentProperty ?p2) -> (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) ^ (?p2 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p1)",
            "(?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) ^ (?p2 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p1) -> (?p1 http://www.w3.org/2002/07/owl#equivalentProperty ?p2)",
            "(?c1 http://www.w3.org/2002/07/owl#hasValue ?i) ^ (?c1 http://www.w3.org/2002/07/owl#onProperty ?p1) ^ (?c2 http://www.w3.org/2002/07/owl#hasValue ?i) ^ (?c2 http://www.w3.org/2002/07/owl#onProperty ?p2) ^ (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) -> (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2)",
            "(?c1 http://www.w3.org/2002/07/owl#someValuesFrom ?y1) ^ (?c1 http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?c2 http://www.w3.org/2002/07/owl#someValuesFrom ?y2) ^ (?c2 http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?y1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?y2) -> (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2)",
            "(?c1 http://www.w3.org/2002/07/owl#someValuesFrom ?y) ^ (?c1 http://www.w3.org/2002/07/owl#onProperty ?p1) ^ (?c2 http://www.w3.org/2002/07/owl#someValuesFrom ?y) ^ (?c2 http://www.w3.org/2002/07/owl#onProperty ?p2) ^ (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) -> (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2)",
            "(?c1 http://www.w3.org/2002/07/owl#allValuesFrom ?y1) ^ (?c1 http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?c2 http://www.w3.org/2002/07/owl#allValuesFrom ?y2) ^ (?c2 http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?y1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?y2) -> (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2)",
            "(?c1 http://www.w3.org/2002/07/owl#allValuesFrom ?y) ^ (?c1 http://www.w3.org/2002/07/owl#onProperty ?p1) ^ (?c2 http://www.w3.org/2002/07/owl#allValuesFrom ?y) ^ (?c2 http://www.w3.org/2002/07/owl#onProperty ?p2) ^ (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) -> (?c2 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c1)"
        ]))
        .concat(OWL2RL.rules.testsFipa)
        .concat(OWL2RL.rules.testsBNode)*/,

    rules: OWL2RL.rules.classSubsumption
        .concat(OWL2RL.rules.propertySubsumption)
        .concat(OWL2RL.rules.transitivity)
        .concat(OWL2RL.rules.inverse)
        .concat(OWL2RL.rules.equivalence)
        .concat(OWL2RL.rules.equality)
        .concat(OWL2RL.rules.domainRange),

    classSubsumption: OWL2RL.rules.classSubsumption,

    subsumption: OWL2RL.rules.classSubsumption
        .concat(OWL2RL.rules.propertySubsumption),

    transitivity: OWL2RL.rules.transitivity,

    transitivityInverse: OWL2RL.rules.transitivity
        .concat(OWL2RL.rules.inverse),

    inverse: OWL2RL.rules.inverse,

    equivalence: OWL2RL.rules.equivalence,

    equality: OWL2RL.rules.equality
};


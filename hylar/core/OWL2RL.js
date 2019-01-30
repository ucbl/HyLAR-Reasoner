/**
 * Created by MT on 17/09/2015.
 */

/**
 * Partial owl2RL spec from http://www.w3.org/TR/owl2-profiles
 * @author Mehdi Terdjimi
 * @type {{rules: *[]}}
 */

var Rule = require('./Logics/Rule'),
    Fact = require('./Logics/Fact'),
    Prefixes = require('./Prefixes'),
    Logics = require('./Logics/Logics');

var Class = Prefixes.get('owl') + 'Class',
    EquivalentClass = Prefixes.get('owl') + 'equivalentClass',
    EquivalentProperty = Prefixes.get('owl') + 'equivalentProperty',
    Thing = Prefixes.get('owl') + 'Thing',
    Nothing = Prefixes.get('owl') + 'Nothing',
    Type = Prefixes.get('rdf') + 'type',
    Subject = Prefixes.get('rdf') + 'subject',
    Predicate = Prefixes.get('rdf') + 'predicate',
    Object = Prefixes.get('rdf') + 'object',
    SubClassOf = Prefixes.get('rdfs') + 'subClassOf',
    SubPropertyOf = Prefixes.get('rdfs') + 'subPropertyOf',
    TransitiveProperty = Prefixes.get('owl') + 'TransitiveProperty',
    InverseOf = Prefixes.get('owl') + 'inverseOf',
    SameAs = Prefixes.get('owl') + 'sameAs',
    Domain = Prefixes.get('rdfs') + "domain",
    Range = Prefixes.get('rdfs') + "range";

/**
 * rdfs/owl entailment rules.
 * @type {{rules: {classSubsumption: *[], propertySubsumption: *[], transitivity: *[], inverse: *[], equivalence: *[], equality: *[]}}}
 */

owl2RL = {
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
                    new Fact('?p1', '?x', '?y', [], true)],
                [new Fact('?p2', '?x', '?y', [], true)], "Property-Equivalence-1"),

            //prp-eqp2
            new Rule([
                    new Fact(EquivalentProperty, '?p1', '?p2', [], true),
                    new Fact('?p2', '?x', '?y', [], true)],
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
        
        ]

    }
};

module.exports = {
    test:owl2RL.rules.classSubsumption
        .concat(owl2RL.rules.propertySubsumption)
        .concat(owl2RL.rules.transitivity)
        .concat(owl2RL.rules.inverse)
        .concat(owl2RL.rules.equivalence)
        .concat(owl2RL.rules.equality)
        .concat(owl2RL.rules.domainRange)
        .concat(Logics.parseRules([
            "(?x ?p1 ?y) ^ (?p2 http://www.w3.org/2002/07/owl#propertyChainAxiom ?n) ^ (?n http://www.w3.org/1999/02/22-rdf-syntax-ns#first ?p1) ^ (?n http://www.w3.org/1999/02/22-rdf-syntax-ns#rest ?n2) ^ (?n2 http://www.w3.org/1999/02/22-rdf-syntax-ns#first ?p2) ^ (?y ?p2 ?z) -> (?x ?p2 ?z)"
        ])),

    rules: owl2RL.rules.classSubsumption
        .concat(owl2RL.rules.propertySubsumption)
        .concat(owl2RL.rules.transitivity)
        .concat(owl2RL.rules.inverse)
        .concat(owl2RL.rules.equivalence)
        .concat(owl2RL.rules.equality)
        .concat(owl2RL.rules.domainRange),

    classSubsumption: owl2RL.rules.classSubsumption,

    subsumption: owl2RL.rules.classSubsumption
        .concat(owl2RL.rules.propertySubsumption),

    transitivity: owl2RL.rules.transitivity,

    transitivityInverse: owl2RL.rules.transitivity
        .concat(owl2RL.rules.inverse),

    inverse: owl2RL.rules.inverse,

    equivalence: owl2RL.rules.equivalence,

    equality: owl2RL.rules.equality
};


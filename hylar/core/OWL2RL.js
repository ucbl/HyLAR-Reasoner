/**
 * Created by MT on 17/09/2015.
 */

/**
 * OWL2RL spec from http://www.w3.org/TR/owl2-profiles
 * @author Mehdi Terdjimi
 * @type {{rules: *[]}}
 */

var Rule = require('./Logics/Rule'),
    Fact = require('./Logics/Fact'),
    Prefixes = require('./Prefixes');

var Class = Prefixes.OWL + 'Class',
    EquivalentClass = Prefixes.OWL + 'equivalentClass',
    EquivalentProperty = Prefixes.OWL + 'equivalentProperty',
    Thing = Prefixes.OWL + 'Thing',
    Nothing = Prefixes.OWL + 'Nothing',
    Type = Prefixes.RDF + 'type',
    SubClassOf = Prefixes.RDFS + 'subClassOf',
    SubPropertyOf = Prefixes.RDFS + 'subPropertyOf',
    TransitiveProperty = Prefixes.OWL + 'TransitiveProperty',
    InverseOf = Prefixes.OWL + 'inverseOf',
    SameAs = Prefixes.OWL + 'sameAs';

/**
 * RDF/OWL entailment rules.
 * @type {{rules: {classSubsumption: *[], propertySubsumption: *[], transitivity: *[], inverse: *[], equivalence: *[], equality: *[]}}}
 */

OWL2RL = {
    rules: {
        classSubsumption: [
            // scm-sco
            new Rule([
                    new Fact(SubClassOf, '?c1', '?c2', [], true),
                    new Fact(SubClassOf, '?c2', '?c3', [], true)],
                [new Fact(SubClassOf, '?c1', '?c3', [], true)]),

            // cax-sco
            new Rule([
                    new Fact(SubClassOf, '?c1', '?c2', [], true),
                    new Fact(Type, '?x', '?c1', [], true)],
                [new Fact(Type, '?x', '?c2', [], true)])
        ],

        propertySubsumption: [
            // scm-spo
            new Rule([
                    new Fact(SubPropertyOf, '?p1', '?p2', [], true),
                    new Fact(SubPropertyOf, '?p2', '?p3', [], true)],
                [new Fact(SubClassOf, '?p1', '?p3', [], true)]),

            // prp-spo1
            new Rule([
                    new Fact(SubPropertyOf, '?p1', '?p2', [], true),
                    new Fact('?p1', '?x', '?y', [], true)],
                [new Fact('?p2', '?x', '?y', [], true)])
        ],

        transitivity: [
            // prp-trp
            new Rule([
                    new Fact('?p', '?x', '?y', [], true),
                    new Fact(Type, '?p', TransitiveProperty, [], true),
                    new Fact('?p', '?y', '?z', [], true)],
                [new Fact('?p', '?x', '?z', [], true)])
        ],

        inverse: [
            //prp-inv1
            new Rule([
                    new Fact(InverseOf, '?p1', '?p2', [], true),
                    new Fact('?p1', '?x', '?y', [], true)],
                [new Fact('?p2', '?y', '?x', [], true)]),

            //prp-inv2
            new Rule([
                    new Fact(InverseOf, '?p1', '?p2', [], true),
                    new Fact('?p2', '?x', '?y', [], true)],
                [new Fact('?p1', '?y', '?x', [], true)])
        ],

        equivalence: [
            //cax-eqc1
            new Rule([
                    new Fact(EquivalentClass, '?c1', '?c2', [], true),
                    new Fact(Type, '?x', '?c1', [], true)],
                [new Fact(Type, '?x', '?c2', [], true)]),

            //cax-eqc2
            new Rule([
                    new Fact(EquivalentClass, '?c1', '?c2', [], true),
                    new Fact(Type, '?x', '?c2', [], true)],
                [new Fact(Type, '?x', '?c1', [], true)]),

            //prp-eqp1
            new Rule([
                    new Fact(EquivalentProperty, '?p1', '?p2', [], true),
                    new Fact('?p1', '?x', 'y', [], true)],
                [new Fact('?p2', '?x', '?y', [], true)]),

            //prp-eqp2
            new Rule([
                    new Fact(EquivalentProperty, '?p1', '?p2', [], true),
                    new Fact('?p2', '?x', 'y', [], true)],
                [new Fact('?p1', '?x', '?y', [], true)])
        ],

        equality: [
            //eq-rep-s
            new Rule([
                    new Fact(SameAs, '?s1', '?s2', [], true),
                    new Fact('?p', '?s1', '?o', [], true)],
                [new Fact('?p', '?s2', '?o', [], true)]),

            //eq-rep-p
            new Rule([
                    new Fact(SameAs, '?p1', '?p2', [], true),
                    new Fact('?p1', '?s', '?o', [], true)],
                [new Fact('?p2', '?s', '?o', [], true)]),

            //eq-rep-o
            new Rule([
                    new Fact(SameAs, '?o1', '?o2', [], true),
                    new Fact('?p', '?s', '?o1', [], true)],
                [new Fact('?p', '?s', '?o2', [], true)]),

            //eq-trans
            new Rule([
                    new Fact(SameAs, '?x', '?y', [], true),
                    new Fact(SameAs, '?y', '?z', [], true)],
                [new Fact(SameAs, '?x', '?z', [], true)])
        ],

        asawoo: [
            new Rule([
                new Fact()
            ],
            [])
        ]

    }
};

module.exports = {
    rules: OWL2RL.rules.classSubsumption
        .concat(OWL2RL.rules.propertySubsumption)
        .concat(OWL2RL.rules.transitivity)
        .concat(OWL2RL.rules.inverse)
        .concat(OWL2RL.rules.equivalence)
        .concat(OWL2RL.rules.equality),

    subsumption: OWL2RL.rules.classSubsumption
        .concat(OWL2RL.rules.propertySubsumption),

    subsumptionTransitivity: OWL2RL.rules.classSubsumption
        .concat(OWL2RL.rules.propertySubsumption)
        .concat(OWL2RL.rules.transitivity),

    subsumptionInverse: OWL2RL.rules.classSubsumption
        .concat(OWL2RL.rules.propertySubsumption)
        .concat(OWL2RL.rules.transitivity)
};

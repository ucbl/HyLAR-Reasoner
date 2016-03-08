/**
 * Created by MT on 17/09/2015.
 */

/**
 * OWL2RL spec from http://www.w3.org/TR/owl2-profiles
 * @author Mehdi Terdjimi
 * @type {{rules: *[]}}
 */

var Logics = require('./Logics'),
    JswRDF = require('./JswRDF'),
    JswOWL = require('./JswOWL');

OWL2RL = {
    rules: [
        // scm-sco
        new Logics.rule([
                new Logics.fact(JswRDF.IRIs.SUBCLASS, '?c1', '?c2', [], true),
                new Logics.fact(JswRDF.IRIs.SUBCLASS, '?c2', '?c3', [], true)],
            new Logics.fact(JswRDF.IRIs.SUBCLASS, '?c1', '?c3', [], true)),

        // cax-sco
        new Logics.rule([
                new Logics.fact(JswRDF.IRIs.SUBCLASS, '?c1', '?c2', [], true),
                new Logics.fact(JswRDF.IRIs.TYPE, '?x', '?c1', [], true)],
            new Logics.fact(JswRDF.IRIs.TYPE, '?x', '?c2', [], true)),

        // scm-cls
        new Logics.rule([
                new Logics.fact(JswRDF.IRIs.TYPE, '?c', JswOWL.IRIs.CLASS, [], true)],
            new Logics.fact(JswRDF.IRIs.SUBCLASS, '?c', '?c', [], true)),
        new Logics.rule([
                new Logics.fact(JswRDF.IRIs.TYPE, '?c', JswOWL.IRIs.CLASS, [], true)],
            new Logics.fact(JswOWL.IRIs.EQUIVALENT_CLASS, '?c', '?c', [], true)),
        new Logics.rule([
                new Logics.fact(JswRDF.IRIs.TYPE, '?c', JswOWL.IRIs.CLASS, [], true)],
            new Logics.fact(JswRDF.IRIs.SUBCLASS, '?c', JswOWL.IRIs.THING, [], true)),
        new Logics.rule([
                new Logics.fact(JswRDF.IRIs.TYPE, '?c', JswOWL.IRIs.CLASS, [], true)],
            new Logics.fact(JswRDF.IRIs.SUBCLASS, JswOWL.IRIs.NOTHING, '?c', [], true))
    ]
        // eq-sym
        .concat(
        'T(?x, owl:sameAs, ?y) -> T(?y, owl:sameAs, ?x)'
            .toRuleSet())

        // eq-trans
        .concat(
        'T(?x, owl:sameAs, ?y) ^ T(?y, owl:sameAs, ?z) -> T(?x, owl:sameAs, ?z)'
            .toRuleSet())

        // cls-hv1
        /*.concat(
        'T(?x, owl:hasValue, ?y) ^ T(?x, owl:onProperty, ?p) ^ T(?u, rdf:type, ?x) -> T(?u, ?p, ?y)'
            .toRuleSet())*/

        //cax-eqc1
        .concat(
        'T(?c1, owl:equivalentClass, ?c2) ^ T(?x, rdf:type, ?c1) -> T(?x, rdf:type, ?c2)'
            .toRuleSet())

        //cax-eqc2
        .concat(
        'T(?c1, owl:equivalentClass, ?c2) ^ T(?x, rdf:type, ?c2) -> T(?x, rdf:type, ?c1)'
            .toRuleSet())

        .slice(0,2)
};

module.exports = {
    rules: OWL2RL.rules
};
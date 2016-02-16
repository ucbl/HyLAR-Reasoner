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
            
        // scm-spo
        new Logics.rule([
                new Logics.fact('http://www.w3.org/2000/01/rdf-schema#subPropertyOf', '?p1', '?p2', [], true),
                new Logics.fact('http://www.w3.org/2000/01/rdf-schema#subPropertyOf', '?p2', '?p3', [], true)],
            new Logics.fact(JswRDF.IRIs.SUBCLASS, '?p1', '?p3', [], true)),

        // prp-spo1
        new Logics.rule([
                new Logics.fact('http://www.w3.org/2000/01/rdf-schema#subPropertyOf', '?p1', '?p2', [], true),
                new Logics.fact('?p1', '?x', '?y', [], true)],
            new Logics.fact('?p2', '?x', '?y', [], true))

    ]
};

module.exports = {
    rules: OWL2RL.rules
};
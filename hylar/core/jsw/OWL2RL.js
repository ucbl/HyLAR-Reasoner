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
    JswRDF = require('./JswRDF'),
    JswOWL = require('./JswOWL');

OWL2RL = {
    rules: [
        // scm-sco
        new Rule([
                new Fact(JswRDF.IRIs.SUBCLASS, '?c1', '?c2', [], true),
                new Fact(JswRDF.IRIs.SUBCLASS, '?c2', '?c3', [], true)],
            [new Fact(JswRDF.IRIs.SUBCLASS, '?c1', '?c3', [], true)]),

        // cax-sco
        new Rule([
                new Fact(JswRDF.IRIs.SUBCLASS, '?c1', '?c2', [], true),
                new Fact(JswRDF.IRIs.TYPE, '?x', '?c1', [], true)],
            [new Fact(JswRDF.IRIs.TYPE, '?x', '?c2', [], true)]),
            
        // scm-spo
        new Rule([
                new Fact('http://www.w3.org/2000/01/rdf-schema#subPropertyOf', '?p1', '?p2', [], true),
                new Fact('http://www.w3.org/2000/01/rdf-schema#subPropertyOf', '?p2', '?p3', [], true)],
            [new Fact(JswRDF.IRIs.SUBCLASS, '?p1', '?p3', [], true)]),

        // prp-spo1
        new Rule([
                new Fact('http://www.w3.org/2000/01/rdf-schema#subPropertyOf', '?p1', '?p2', [], true),
                new Fact('?p1', '?x', '?y', [], true)],
            [new Fact('?p2', '?x', '?y', [], true)]),

	// prp-trp
	new Rule([
                new Fact(JswRDF.IRIs.TYPE, '?p', 'http://www.w3.org/2002/07/owl#TransitiveProperty', [], true),
                new Fact('?p', '?x', '?y', [], true),
		new Fact('?p', '?y', '?z', [], true)],
            [new Fact('?p', '?x', '?z', [], true)])

    ]
};

module.exports = {
    rules: OWL2RL.rules
};

/*
 * Created by MT on 20/11/2015.
 */

var Fact = require('./Logics/Fact'),
    Errors = require('./Errors'),
    RegularExpressions = require('./RegularExpressions');

var rdflib = require('rdflib'),
    q = require('q');
    sparqlJs = require('sparqljs'),

    SparqlParser = new sparqlJs.Parser(),
    RdfXmlParser = new rdflib.RDFParser();

/**
 * The parsing interface, for transforming facts, triples, turtle or even results bindings
 * into other representations.
 */

/**
 * The SPARQL parser oddly transforms prefixed typed literal without angle brackets (!).
 * This should fix it.
 */
String.prototype.format = function() {
    if (this.match(RegularExpressions.LITERAL_UNFORMATTED)) {
        return this.replace(RegularExpressions.LITERAL_UNFORMATTED, "$1<$2>");
    } else {
        return this;
    }
};

module.exports = {

    /**
     * Parses rdf/xml to turtle using rdf ext.
     * @param data Raw rdf/xml data (str)
     * @returns {*}
     */
    rdfXmlToTurtle: function(data) {
        var deferred = q.defer(), triple;
        RdfXmlParser.parse(data, function(parsed, err) {
            if(err) deferred.reject(err);

            var triples = parsed._graph,
                turtle = '';
            for (var i = 0; i < triples.length; i++) {
                triple = triples[i];
                turtle += triple + '\n';
            }
            deferred.resolve(turtle);
        });
        return deferred.promise;
    },

    /**
     * Transforms a triple into a fact.
     * @param t The triple
     * @param explicit True if the resulting fact is explicit, false otherwise (default: true)
     * @returns Object resulting fact
     */
    tripleToFact: function(t, explicit, notUsingValid) {
        if(explicit === undefined) {
            explicit = true;
        }
        return new Fact(t.predicate.toString(), t.subject.toString(), t.object.toString().format(), [], explicit, [], [], notUsingValid)
    },

    triplesToFacts: function(t, explicit, notUsingValid) {
        var arr = [], triple,
            that = this;

        if(explicit === undefined) {
            explicit = true;
        }

        for (var i = 0; i < t.length; i++) {
            triple = t[i];
            arr.push(that.tripleToFact(triple, explicit, notUsingValid));
        }
        return arr;
    },

    /**
     * Transforms a raw entity (URI or literal) into turtle.
     * @param entityStr
     * @returns {*}
     */
    parseStrEntityToTurtle: function(entityStr) {
        var literalPattern = RegularExpressions.LITERAL,
            blankNodePattern = RegularExpressions.BLANK_NODE,
            variablePattern = RegularExpressions.VARIABLE,
            typeOfDatatypePattern = RegularExpressions.DATATYPE_TYPE,
            dblQuoteInStrPattern = RegularExpressions.DBLQUOTED_STRING,
            dblQuoteMatch;

        if (entityStr === undefined) return false;
        if (entityStr.match(literalPattern)) {
            entityStr = entityStr.replace(literalPattern, '$1$2');
            dblQuoteMatch = entityStr.match(dblQuoteInStrPattern);
            return dblQuoteMatch[1] + dblQuoteMatch[2].replace(/"/g, '\\"') + dblQuoteMatch[3];
        } else if(entityStr.match(blankNodePattern) || entityStr.match(variablePattern) || entityStr.match(typeOfDatatypePattern)) {
            return entityStr

        } else {
            return '<' + entityStr + '>';
        }
    },

    /**
     * Transforms a fact into turtle.
     * @param fact
     * @returns {string}
     */
    factToTurtle: function(fact) {
        var subject = this.parseStrEntityToTurtle(fact.subject),
            predicate = this.parseStrEntityToTurtle(fact.predicate),
            object = this.parseStrEntityToTurtle(fact.object);

        if (subject && predicate && object) {
            return subject + ' ' + predicate + ' ' + object + ' . ';
        } else {
            return '';
        }
    },

    /**
     * Transforms a set of facts into turtle.
     * @param facts
     * @returns {string}
     */
    factsToTurtle: function(facts) {
        var ttl = '', fact,
            that = this;
        for (var i = 0; i < facts.length; i++) {
            fact = facts[i];
            ttl += that.factToTurtle(fact);
        }
        return ttl;
    },

    /**
     * Parses a SPARQL query.
     * @param query
     * @returns {*}
     */
    parseSPARQL: function(query) {
        return SparqlParser.parse(query);
    },

    /**
     * Replace a variable from a result binding.
     * @param elem Element to be replaced (subject, predicate or object)
     * @param binding The result binding
     * @param value The value to replace
     * @returns The replaced element
     */
    replaceVar: function(elem, binding, vars) {
        for (var key in vars) {
            var variable = vars[key],
                variableRegExpPattern = new RegExp('\\?'+variable, 'g');
            if (elem.match(variableRegExpPattern)) {
                elem = elem.replace(variableRegExpPattern, binding[variable].value);
                if (binding[variable].token == 'literal') {
                    elem = '"' + elem + '"';
                } else {
                    elem = '<' + elem + '>';
                }
            } else {
                elem = this.parseStrEntityToTurtle(elem);
            }
        }
        return elem;
    },

    /**
     * Replaces variables in triples from results bindings.
     * @param vars The variables to be replaced
     * @param triples The triples to be replaced
     * @param results The results bindings
     * @returns {Array} The replaced triples.
     */
    replaceVars: function(vars, triples, results) {
        var returned = [],
            triple, binding,
            that = this;

        for (var i = 0; i < triples.length; i++) {
            triple = triples[i];

            for (var k = 0; k < results.length; k++) {
                var subject = triple.subject,
                    predicate = triple.predicate,
                    object = triple.object;

                binding = results[k];
                subject = that.replaceVar(subject, binding, vars);
                object = that.replaceVar(object, binding, vars);
                predicate = that.replaceVar(predicate, binding, vars);
                returned.push(subject + ' ' + predicate + ' ' + object + ' .  \n');
            }
        }
        return returned;
    },

    /**
     * Builds new triples from results bindings,
     * given their original query. This function is
     * used to tag-filter unfiltered store results.
     * @param originalQuery Query originally launched against the store
     * @param queryResults Results sent by the store
     * @returns {Array} The newly build triples
     */
    constructTriplesFromResultBindings: function(originalQuery, queryResults) {
        var that = this,
            t = [],
            vars, statement;

        try {
            vars = Object.keys(queryResults[0]);
        } catch(e) {
            vars = []
        }

        for (var i = 0; i < originalQuery.where.length; i++) {
            statement = originalQuery.where[i];
            if(statement.type == 'bgp') {
                t = t.concat(that.replaceVars(vars, statement.triples, queryResults));
            }
        }

        return t;
    },

    /**
     * Reforms results from a construct query,
     * after tag-filtering.
     * @param results
     * @param ttl
     * @param blanknodes
     * @returns {*}
     */
    reformConstructResults: function(results, ttl, blanknodes) {
        console.notify('Started construct results reform.');
        var triples = [], triple, m;
        for (var i = 0; i < results.triples.length; i++) {
            triple = results.triples[i];
            m = triple.toString().match(RegularExpressions.END_OF_TRIPLE);
            if(m && ttl.toString().indexOf(m[0]) !== -1) triples.push(triple);
        }
        triples = triples.concat(blanknodes);
        results.triples = triples;
        results.length = triples.length;
        console.notify('Finished construct results reform.');
        return results;
    },

    /**
     * Returns bindings that have not been
     * tag-filtered.
     * @param results
     * @param ttl
     * @param blanknodes
     * @returns {*}
     */
    getValidBindings: function(bindings, triple, ttl) {
        var replaced,
            subject = triple.subject,
            predicate = triple.predicate,
            object = triple.object,
            validBindings = [],
            vars = Object.keys(bindings);

        subject = this.replaceVar(subject, bindings, vars);
        object = this.replaceVar(object, bindings, vars);
        predicate = this.replaceVar(predicate, bindings, vars);

        replaced = subject + ' ' + predicate + ' ' + object + ' . ';
        if(replaced && ttl.toString().indexOf(replaced) !== -1) {
            validBindings.push(bindings);
        }

        return validBindings;
    },

    /**
     * Reforms results from a construct query,
     * after tag-filtering.
     * @param results
     * @param ttl
     * @param blanknodes
     * @returns {*}
     */
    reformSelectResults: function(parsedQuery, results, ttl) {
        var that = this, statement, wtriple, b,
            returning = [];

        for (var i = 0; i < parsedQuery.where.length; i++) {
            statement = parsedQuery.where[i];
            if (statement.type == 'bgp') {
                for (var j = 0; j < statement.triples.length; j++) {
                    wtriple = statement.triples[j];
                    for (var k = 0; k < results.length; k++) {
                        b = results[k];
                        returning = returning.concat(that.getValidBindings(b, wtriple, ttl));
                    }
                }
            }
        }
        return returning;
    }
};

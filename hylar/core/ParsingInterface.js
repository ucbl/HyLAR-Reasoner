/*
 * Created by MT on 20/11/2015.
 */

var Fact = require('./Logics/Fact');

var rdfext = require('rdf-ext')(),
    q = require('q');
    sparqlJs = require('sparqljs'),

    SparqlParser = new sparqlJs.Parser(),
    RdfXmlParser = new rdfext.RdfXmlParser();

module.exports = {

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

    tripleToFact: function(t, explicit) {
        if(explicit === undefined) {
            explicit = true;
        }
        return new Fact(t.predicate.toString(), t.subject.toString(), t.object.toString(), [], explicit)
    },

    triplesToFacts: function(t, explicit) {
        var arr = [], triple,
            that = this;

        if(explicit === undefined) {
            explicit = true;
        }

        for (var i = 0; i < t.length; i++) {
            triple = t[i];
            arr.push(that.tripleToFact(triple, explicit));
        }
        return arr;
    },

    parseStrEntityToTurtle: function(entityStr) {
        var literalPattern = /^("[\s\S]*")(\^\^<.+>)*$/i,
            blankNodePattern = /^_:/i,
            variablePattern = /^\?/i,
            dblQuoteInStrPattern = /^(")([\s\S]*)(".*)$/i, dblQuoteMatch;

        if(entityStr.match(literalPattern)) {
            entityStr = entityStr.replace(literalPattern, '$1$2');
            try {
                dblQuoteMatch = entityStr.match(dblQuoteInStrPattern);
                return dblQuoteMatch[1] + dblQuoteMatch[2].replace(/"/g, '\\"') + dblQuoteMatch[3];
            } catch(e) {
                1;
            }

        } else if(entityStr.match(blankNodePattern) || entityStr.match(variablePattern)) {
            return entityStr

        } else {
            return '<' + entityStr + '>';
        }
    },

    factToTurtle: function(fact) {
        var subject = this.parseStrEntityToTurtle(fact.subject),
            predicate = this.parseStrEntityToTurtle(fact.predicate),
            object = this.parseStrEntityToTurtle(fact.object);

        return subject + ' ' + predicate + ' ' + object + ' . ';
    },

    factsToTurtle: function(facts) {
        var ttl = '', fact,
            that = this;
        for (var i = 0; i < facts.length; i++) {
            fact = facts[i];
            ttl += that.factToTurtle(fact);
        }
        return ttl;
    },

    ruleToTurtle: function(rule) {
        var causesTurtle = this.factsToTurtle(rule.causes),
            consequencesTurtle = this.factsToTurtle(rule.consequences);

        return {
            causes: causesTurtle,
            consequences: consequencesTurtle
        }
    },

    parseSPARQL: function(query) {
        return SparqlParser.parse(query);
    },

    replaceVar: function(elem, binding, value) {
        var variableRegExpPattern = new RegExp('\\?'+value, 'g');
        if(elem.match(variableRegExpPattern)) {
            elem = elem.replace(variableRegExpPattern, binding[value].value);
            if(binding[value].token == 'literal') elem = '"' + elem + '"';
            else elem = '<' + elem + '>';
        } else if(!elem.match(/^"(.+)"/g)) {
            elem = '<' + elem + '>';
        }
        return elem;
    },

    replaceVars: function(vars, triples, results) {
        var returned = [],
            triple, value, binding, subject, predicate, object,
            that = this;

        for (var i = 0; i < triples.length; i++) {
            triple = triples[i];
            for (var j = 0; j < vars.length; j++) {
                value = vars[j];
                for (var k = 0; k < results.length; k++) {
                    binding = results[k];
                    subject = that.replaceVar(triple.subject, binding, value);
                    object = that.replaceVar(triple.object, binding, value);
                    predicate = that.replaceVar(triple.predicate, binding, value);
                    returned.push(subject + ' ' + predicate + ' ' + object + ' .  \n');
                }
            }
        }
        return returned;
    },

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
            t = t.concat(that.replaceVars(vars, statement.triples, queryResults));
        }

        return t;
    },

    reformConstructResults: function(results, ttl, blanknodes) {
        var triples = [], triple, m;
        for (var i = 0; i < results.triples.length; i++) {
            triple = results.triples[i];
            m = triple.toString().match(/^(.+)(> \.)/i);
            if(m && ttl.toString().indexOf(m[0]) !== -1) triples.push(triple);
        }
        triples = triples.concat(blanknodes);
        results.triples = triples;
        results.length = triples.length;
        return results;
    },

    getValidBindings: function(bindings, triple, ttl) {
        var bindings = [],
            replaced, subject, predicate, object;
        for (var key in bindings) {
            subject = this.replaceVar(triple.subject, bindings, key);
            object = this.replaceVar(triple.object, bindings, key);
            predicate = this.replaceVar(triple.predicate, bindings, key);
            replaced = subject + ' ' + predicate + ' ' + object + ' . ';

            if(replaced && ttl.toString().indexOf(replaced) !== -1) {
                bindings.push(bindings);
            }
        }
        return bindings;
    },

    reformSelectResults: function(parsedQuery, results, ttl) {
        var that = this, statement, wtriple, b,
            returning = [];

        for (var i = 0; i < parsedQuery.where.length; i++) {
            statement = parsedQuery.where[i];
            for (var j = 0; j < statement.triples.length; j++) {
                wtriple = statement.triples[j];
                for (var k = 0; k < results.length; k++) {
                    b = results[k];
                    returning = returning.concat(that.getValidBindings(b, wtriple, ttl));
                }
            }
        }
        return returning;
    }
};

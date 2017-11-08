/*
 * Created by MT on 20/11/2015.
 */

var Fact = require('./Logics/Fact'),
    Errors = require('./Errors'),
    RegularExpressions = require('./RegularExpressions'),
    Utils = require('./Utils');

var rdfext = require('rdf-ext'),
    q = require('q'),
    sparqlJs = require('sparqljs'),

    SparqlParser = new sparqlJs.Parser(),
    RdfXmlParser = new rdfext.Parsers();

/**
 * The parsing interface, for transforming facts, triples, turtle or even results bindings
 * into other representations.
 */

/**
 * The SPARQL parser oddly transforms prefixed typed literal without angle brackets (!).
 * This should fix it.
 */
/**
 * @deprecated Caused some literals that contain stuff like "blabla\" xsd:string"@en to be replaced with "blabla \" <xsd:string"@en>
 * @returns {string}
 */
String.prototype.format = function() {
    if (this.match(RegularExpressions.LITERAL_UNFORMATTED)) {
        return this.replace(RegularExpressions.LITERAL_UNFORMATTED, "$1<$2>");
    } else {
        return this.toString();
    }
};



    /**
     * Parses rdf/xml to turtle using rdf ext.
     * @param data Raw rdf/xml data (str)
     * @returns {*}
     */
ParsingInterface = {
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
        return new Fact(t.predicate.toString(), t.subject.toString(), t.object.toString()/*.format()*/, [], explicit, [], [], notUsingValid, t.toString())
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
        var literalPattern = RegularExpressions.LITERAL_UNFORMATTED,
            blankNodePattern = RegularExpressions.BLANK_NODE,
            variablePattern = RegularExpressions.VARIABLE,
            typeOfDatatypePattern = RegularExpressions.DATATYPE_TYPE,
            dblQuoteInStrPattern = RegularExpressions.DBLQUOTED_STRING,
            dblQuoteMatch;

        /*try {
            entityStr = entityStr.format();
        } catch(e){}*/

        entityStr = entityStr.replace(/(\n|\r)/g, '');

        if (entityStr === undefined) return false;

        if (entityStr.match(dblQuoteInStrPattern)) {
            dblQuoteMatch = entityStr.match(dblQuoteInStrPattern);
            entityStr = dblQuoteMatch[1] + dblQuoteMatch[2].replace(/(")/g, "'") + dblQuoteMatch[3]; //temporary ; has to be debbuged asap            
        }

        if (entityStr.match(literalPattern)) {
            return entityStr.replace(literalPattern, '$1<$2>');
        } else if(entityStr.match(blankNodePattern) || entityStr.match(variablePattern) || entityStr.match(typeOfDatatypePattern) || entityStr.match(dblQuoteInStrPattern)) {
            return entityStr;
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
        var subject, predicate, object;

        /*if (fact.fromTriple !== undefined) {
            return fact.fromTriple;
        }*/

        if(fact.falseFact) {
            return '';
        }

        subject = this.parseStrEntityToTurtle(fact.subject);
        predicate = this.parseStrEntityToTurtle(fact.predicate);
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

    updateWhereToConstructWhere: function(query, doParse) {
        return query.replace(RegularExpressions.DELETE_OR_INSERT_STATEMENT, 'CONSTRUCT$2');
    },

    /**
     * Parses a SPARQL query.
     * @param query
     * @returns {*}
     */
    parseSPARQL: function(query) {
        return SparqlParser.parse(query);
    },

    tripleToTurtle: function(triple) {
        var ttl = this.parseStrEntityToTurtle(triple.subject.toString()) + " "
                + this.parseStrEntityToTurtle(triple.predicate.toString()) + " "
                + this.parseStrEntityToTurtle(triple.object.toString()) + " . ";
        return ttl;
    },

    triplesToTurtle: function(triples) {
        var ttl = '';
        for (var i = 0; i < triples.length; i++) {
            ttl += this.tripleToTurtle(triples[i]).replace(/(\n|\r)/g, '').replace(/\\&/g, '&');
        }
        return ttl;
    },

    isolateWhereQuery: function(parsedQuery, whereIndex) {
        var isolatedQuery,
            patterns = parsedQuery.where[whereIndex].patterns;
        if (parsedQuery.queryType == 'SELECT') {
            isolatedQuery = parsedQuery.queryType + " "
                + parsedQuery.variables.join(' ')
                + " { ";
        } else if (parsedQuery.queryType == 'CONSTRUCT') {
            isolatedQuery = parsedQuery.queryType + " { ";
            for (var i = 0; i < parsedQuery.template.length; i++) {
               isolatedQuery += this.tripleToTurtle(parsedQuery.template[i]);
            }
            isolatedQuery += " } WHERE { ";
        }

        if (parsedQuery.where[whereIndex].name !== undefined) {
            isolatedQuery += " GRAPH <" + parsedQuery.where[whereIndex].name + "> ";
        }
        isolatedQuery += " { ";
        if (patterns != null) {
            for (var i = 0; i < patterns.length; i++) {
                isolatedQuery += " " + this.triplesToTurtle(patterns[i].triples) + " ";
            }
        } else {
            isolatedQuery += " " + this.triplesToTurtle(parsedQuery.where[whereIndex].triples) + " ";
        }
        isolatedQuery += " } ";

        return isolatedQuery + " } ";
    },

    constructEquivalentQuery: function(query, graph) {
        var rewrittenQuery, regex;

        if (query.match(RegularExpressions.CONSTRUCT_BODYQUERY_WITH_BRACKETS)) {
            query = query.replace(RegularExpressions.CONSTRUCT_BODYQUERY_WITH_BRACKETS, '$1');
        }

        if (query.match(RegularExpressions.NO_BRACKET_BODYQUERY)) {
            regex = RegularExpressions.NO_BRACKET_BODYQUERY;
        } else {
            regex = RegularExpressions.SINGLE_BRACKET_BODYQUERY;
        }

        if (graph) {
            rewrittenQuery = query.replace(regex, 'CONSTRUCT { $1 } WHERE { GRAPH <' + graph + '> { $1 } }');
        } else {
            rewrittenQuery = query.replace(regex, 'CONSTRUCT { $1 } WHERE { $1 }');
        }

        return rewrittenQuery;
    },

    isUpdateWhere: function(parsedQuery) {
        var res;
        try {
            if ( (parsedQuery.updates[0].where)
                || (parsedQuery.updates[0].updateType == "deletewhere")
                || (parsedQuery.updates[0].updateType == "insertwhere")) {
                return true;
            } else {
                return false;
            }
        } catch(e) {
            return false;
        }
    },

    isInsert: function(parsedQuery) {
        var res;
        try {
            res = parsedQuery.updates[0].insert.length > 0;
        } catch(e) {
            return false;
        }
        return res;
    },

    buildUpdateQueryWithConstructResults: function(initialQuery, results) {
        switch(this.isInsert(initialQuery)) {
            case true:
                return "INSERT DATA { " + this.triplesToTurtle(results.triples) + " }";
                break;
            default:
                return "DELETE DATA { " + this.triplesToTurtle(results.triples) + " }";
        }
    }
};

module.exports = ParsingInterface;

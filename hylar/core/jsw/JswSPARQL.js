/**
 * Created by Spadon on 17/10/2014.
 */
JswXSD = require('./JswXSD');
JswRDFQuery = require('./JswRDFQuery');
xsd = new JswXSD.xsd();
rdfQuery = new JswRDFQuery.rdfQuery();

SPARQL = {
// ============================= SPARQL namespace =============================
    /**
     * An object which can be used to work with SPARQL queries.
     *
     * The features currently not supported by the parser:
     * - Proper relative IRI resolution;
     * - Blank Nodes;
     * - Comments;
     * - Nested Graph Patterns;
     * - FILTER expressions;
     * - ORDER BY: expressions other than variables;
     * - RDF Collections;
     * - OPTIONAL patterns;
     * - UNION of patterns;
     * - FROM clause (and, hence, GRAPH clause and named graphs).
     */
    /** Defines data types of literals which can be parsed */
    DataTypes: xsd.DataTypes,
    /** Defines types of expressions which can be parsed */
    ExpressionTypes: rdfQuery.prototype.ExpressionTypes,

    /** Regular expression for SPARQL absolute IRI references. */
    absoluteIriRegExp: null,
//AJOUT Lionel
    /** Regular expression for SPARQL local IRI references. */
    localIriRegExp: null,
    /** Regular expression for SPARQL boolean literals. */
    boolRegExp: null,
    /** Regular expression for SPARQL decimal literals. */
    decimalRegExp: null,
    /** Regular expression for SPARQL double literals. */
    doubleRegExp: null,
    /** Regular expression for SPARQL integer literals. */
    intRegExp: null,
    /** Regular expression for SPARQL IRI references. */
    iriRegExp: null,
    /** Regular expression representing one of the values in the ORDER BY clause. */
    orderByValueRegExp: null,
    /** Regular expression for SPARQL prefixed names. */
    prefixedNameRegExp: null,
    /** Regular expression for SPARQL prefix name. */
    prefixRegExp: null,
    /** Regular expression for RDF literals. */
    rdfLiteralRegExp: null,
    /** Regular expression for SPARQL variables. */
    varRegExp: null,

    /**
     * Expands the given prefixed name into the IRI reference.
     *
     * @param prefix Prefix part of the name.
     * @param localName Local part of the name.
     * @return IRI reference represented by the given prefix name.
     * @param query
     */
    expandPrefixedName: function (prefix, localName, query) {

        var iri;

        if (!prefix && !localName) {
            throw 'Can not expand the given prefixed name, since both prefix and local name are ' +
                'empty!';
        }

        prefix = prefix || '';
        localName = localName || '';

        iri = query.getPrefixIri(prefix);

        if (iri === null) {
            throw 'Prefix "' + prefix + '" has not been defined in the query!';
        }

        return iri + localName;
    },

    /** Initializes regular expressions used by parser. */
    init: function () {
        var pnCharsBase = "A-Za-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D" +
                "\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF" +
                "\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\u10000-\\uEFFFF",
            pnCharsU = pnCharsBase + "_",
            pnChars = pnCharsU + "0-9\\-\\u00B7\\u0300-\\u036F\\u203F-\\u2040",
            pnNameNs = "([" + pnCharsBase + "][" + pnChars + ".]*[" + pnChars + "])?:",
            pnLocal = "([" + pnCharsU + "0-9](?:[" + pnChars + ".]*[" + pnChars + "])?)?",
            varRegExp = "[?$][" + pnCharsU + "0-9][" + pnCharsU + "0-9\\u00B7\\u0300-\\u036F" +
                "\\u203F-\\u2040]*",
        //CHANGEMENT Lionel
        //Bug in \\[tbnrf\\\"'] -> not interpreted in JS as [\t\b\n...]
        //Added an echar variable (as in the spec) and used it in the string variable
            echar = "[\\t\\b\\n\\r\\f\\\\\\" + '"' + "\\']",
            string = "'((?:[^\\x27\\x5C\\xA\\xD]|" + echar + ")*)'|" +
                '"((?:[^\\x22\\x5C\\xA\\xD]|' + echar + ')*)"|' +
                '"""((?:(?:"|"")?(?:[^"\\]|' + echar + '))*)"""|' +
                "'''((?:(?:'|'')?(?:[^'\\]|" + echar + "))*)'''",
        //Ancien code
        //string = "'((?:[^\\x27\\x5C\\xA\\xD]|\\[tbnrf\\\"'])*)'|" +
        //'"((?:[^\\x22\\x5C\\xA\\xD]|\\[tbnrf\\"\'])*)"|' +
        //'"""((?:(?:"|"")?(?:[^"\\]|\\[tbnrf\\"\']))*)"""|' +
        //"'''((?:(?:'|'')?(?:[^'\\]|\\[tbnrf\\\"']))*)'''",
            iriRef = '<[^<>"{}|^`\\][\\x00-\\x20]*>',
            prefixedName = pnNameNs + pnLocal,
            exponent = '[eE][+-]?[0-9]+';

        this.absoluteIriRegExp = /^<\w*:\/\//; // TODO: This is not precise.
        //AJOUT Lionel
        this.localIriRegExp = /^<#.*>$/; // TODO: This is not precise.
        this.boolRegExp = /^true$|^false$/i;
        this.intRegExp = /^(?:\+|-)?[0-9]+$/;
        this.decimalRegExp = /^(?:\+|-)?(?:[0-9]+\.[0-9]*|\.[0-9]+)$/;
        this.doubleRegExp = new RegExp('^(?:\\+|-)?(?:[0-9]+\\.[0-9]*' + exponent + '|\\.[0-9]+' +
            exponent + '|[0-9]+' + exponent + ')$');
        this.iriRegExp = new RegExp('^' + iriRef + '$');
        this.orderByValueRegExp = new RegExp('^(ASC|DESC)\\((' + varRegExp + ')\\)$|^' + varRegExp +
            '$', "i");
        this.prefixRegExp = new RegExp("^" + pnNameNs + "$");
        this.prefixedNameRegExp = new RegExp("^" + prefixedName + "$");
        this.rdfLiteralRegExp = new RegExp('^(?:' + ''/*string */+ '.*)(?:@([a-zA-Z]+(?:-[a-zA-Z0-9]+)*)|' +
            '\\^\\^(' + iriRef + ')|\\^\\^' + prefixedName + ')?$');
        this.varRegExp = new RegExp('^' + varRegExp + '$');
    },

    /**
     * Parses the given SPARQL string into the query.
     *
     * @param queryTxt SPARQL string to parse into the query.
     * @return rdfQuery object representing the query parsed.
     */
    parse: function (queryTxt) {
        var iri, object, predicate, prefix, query, subject, token, tokens, tokenCount,
            tokenIndex, valueToRead, variable, vars;

        if (!queryTxt) {
            throw 'The query text is not specified!';
        }

        query = new rdfQuery();
        tokens = queryTxt.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g);
        tokenCount = tokens.length;
        tokenIndex = 0;

        if (tokens[tokenIndex].toUpperCase() === 'BASE') {
            tokenIndex += 1;

            query.baseIri = this.parseAbsoluteIri(tokens[tokenIndex]);

            if (query.baseIri === null) {
                throw 'BASE statement does not contain a valid IRI reference!';
            }

            tokenIndex += 1;
        }

// Read all PREFIX statements...
        while (tokenIndex < tokenCount) {
            token = tokens[tokenIndex];

            if (token.toUpperCase() !== 'PREFIX') {
                break;
            }

            tokenIndex += 1;

            if (tokenIndex === tokenCount) {
                throw 'Prefix name expected, but end of the query text found!';
            }

            prefix = this.parsePrefixName(tokens[tokenIndex]);

            if (prefix === null) {
                throw 'Token "' + token + '" does not represent a valid IRI prefix!';
            }

            tokenIndex += 1;

            if (tokenIndex === tokenCount) {
                throw 'Prefix IRI expected, but end of the query text found!';
            }

            iri = this.parseIriRef(tokens[tokenIndex], query);

            if (iri === null) {
                throw 'Incorrect format of the IRI encountered!';
            }

            query.addPrefix(prefix, iri);

            tokenIndex += 1;
        }

// Parse SELECT, INSERT DATA or DELETE DATA clauses.
        if (tokenIndex === tokenCount) {
            return query;
        } else if (token.toUpperCase() == 'DELETE' || token.toUpperCase() == 'INSERT') {
            //  UPDATE STATEMENT @author Mehdi Terdjimi
            query.statementType = token;
            tokenIndex++;
            token = tokens[tokenIndex];

            if (token != 'DATA')  throw 'Expected DATA after ' + query.statementType +', having ' + token;

            tokenIndex++;
            token = tokens[tokenIndex];

            if (token != '{') throw 'Expected "{", having ' + token;

            for (tokenIndex++; tokenIndex < tokens.length; tokenIndex++) {
                token = tokens[tokenIndex];
                if(token.toUpperCase() == 'GRAPH') {
                    var parsed = this.parseGraph(tokens, tokenIndex, query),
                        query = parsed.query,
                        tokenIndex = parsed.index;
                    token = token[tokenIndex];
                } else if(!(token == '}' || token == '.')) {
                    var parsed = this.parseTriple(tokens, tokenIndex, query),
                        query = parsed.query,
                        tokenIndex = parsed.index;
                    token = tokens[tokenIndex];
                }
            }
        } else if (token.toUpperCase() !== 'SELECT') {
            throw 'SELECT, INSERT or DELETE statement expected, but "' + token + '" was found!';
        } else {
            query.statementType = 'SELECT';
            tokenIndex += 1;

            if (tokenIndex === tokenCount) {
                throw 'DISTINCT/REDUCED or variable declaration expected after "SELECT", but the end ' +
                    'of query text was found!';
            }

            token = tokens[tokenIndex].toUpperCase();

            if (token === 'DISTINCT') {
                query.distinctResults = true;
                tokenIndex += 1;
            } else if (token === 'REDUCED') {
                query.reducedResults = true;
                tokenIndex += 1;
            }

            if (tokenIndex === tokenCount) {
                throw 'Variable declarations are expected after DISTINCT/REDUCED, but the end of ' +
                    'the query text was found!';
            }

            token = tokens[tokenIndex];

            if (token === '*') {
                tokenIndex += 1;

                token = tokens[tokenIndex];
            } else {
                vars = [];

                // Parse SELECT variables.
                while (tokenIndex < tokenCount) {
                    token = tokens[tokenIndex];

                    if (token.toUpperCase() === 'WHERE' || token === '{' || token.toUpperCase() === 'FROM') {
                        break;
                    }

                    variable = this.parseVar(token);

                    if (variable) {
                        vars.push(variable);
                    } else {
                        throw 'The token "' + token + '" does not represent the valid variable!';
                    }

                    tokenIndex += 1;
                }

                if (vars.length === 0) {
                    throw 'No variable definitions found in the SELECT clause!';
                }

                query.variables = vars;
            }

            if (tokenIndex === tokenCount) {
                return query;
            }

            // Named graphs parsing
            query.graphs = [];
            while (tokens[tokenIndex] === 'FROM') {
                tokenIndex += 1;
                if (tokens[tokenIndex].toUpperCase() != 'NAMED') {
                    throw 'NAMED expected: only NAMED graphs are currently supported';
                }
                tokenIndex += 1;
                var graph = this.parseAbsoluteIri(tokens[tokenIndex]);
                query.graphs.push(graph);
                tokenIndex += 1;
            }

            if (tokens[tokenIndex].toUpperCase() === 'WHERE') {
                if (tokens[tokenIndex + 1] === '{') {
                    tokenIndex += 2; // Skip to the next token after '{'.
                } else {
                    throw 'WHERE clause should be surrounded with "{}"!';
                }
            } else if (tokens[tokenIndex] === '{') {
                tokenIndex += 1;
            } else {
                throw 'WHERE clause was expected, but "' + token + '" was found!';
            }

// Parsing WHERE clause.
            valueToRead = 0;

            while (tokenIndex < tokenCount) {
// TODO: Add parsing filters.
                token = tokens[tokenIndex];

                if (token === '}') {
                    if (valueToRead === 0) {
                        break;
                    } else {
                        throw 'RDF triple is not complete but the end of WHERE clause was found!';
                    }
                }

                if (valueToRead === 0) {
                    subject = this.parseVarOrTerm(token, query);

                    if (subject === null) {
                        throw 'Subject variable or term was expected but "' + token + '" was found!';
                    }

                    tokenIndex += 1;
                    valueToRead += 1;

                    if (tokenIndex === tokenCount) {
                        throw 'Predicate of the RDF triple expected, reached the end of text instead!';
                    }
                } else if (valueToRead === 1) {
                    predicate = this.parseVerb(token, query);

                    if (predicate === null) {
                        throw 'Predicate verb was expected but "' + token + '" was found!';
                    }

                    tokenIndex += 1;
                    valueToRead += 1;

                    if (tokenIndex === tokenCount) {
                        throw 'Object of the RDF triple expected, reached the end of text instead!';
                    }
                } else if (valueToRead === 2) {
                    object = this.parseVarOrTerm(token, query);

                    if (object === null) {
                        throw 'Object variable or term was expected but "' + token + '" was found!';
                    }

                    query.addTriple(subject, predicate, object);

                    valueToRead = 0;
                    tokenIndex += 1;

                    switch (tokens[tokenIndex]) {
                        case '.':
                            valueToRead = 0;
                            tokenIndex += 1;
                            break;
                        case ';':
                            valueToRead = 1;
                            tokenIndex += 1;
                            break;
                        case ',':
                            valueToRead = 2;
                            tokenIndex += 1;
                            break;
                    }
                }
            }

            if (tokenIndex === tokenCount) {
                throw '"}" expected but the end of query text found!';
            }

            tokenIndex += 1;

            if (tokenIndex === tokenCount) {
                return query;
            }

            if (tokens[tokenIndex].toUpperCase() === 'ORDER') {
                tokenIndex += 1;

                token = tokens[tokenIndex];


                if (token.toUpperCase() !== 'BY') {
                    throw '"BY" expected after "ORDER", but "' + token + '" was found!';
                }

                tokenIndex += 1;

                while (tokenIndex < tokenCount) {
                    token = tokens[tokenIndex];

                    if (token.toUpperCase() === 'LIMIT' || token.toUpperCase() === 'OFFSET') {
                        break;
                    }

                    variable = this.parseOrderByValue(token);

                    if (variable === null) {
                        throw 'Unknown token "' + token + '" was found in the ORDER BY clause!';
                    }

                    query.orderBy.push(variable);
                    tokenIndex += 1;
                }
            }

            while (tokenIndex < tokenCount) {
                token = tokens[tokenIndex].toUpperCase();

// Parse LIMIT clause.
                if (token === 'LIMIT') {
                    tokenIndex += 1;

                    if (tokenIndex === tokenCount) {
                        throw 'Integer expected after "LIMIT", but the end of query text found!';
                    }

                    token = tokens[tokenIndex];
                    query.limit = parseInt(token, 10);

                    if (isNaN(query.limit)) {
                        throw 'Integer expected after "LIMIT", but "' + token + '" found!';
                    }

                    tokenIndex += 1;
                } else if (token === 'OFFSET') {
// Parse OFFSET clause.
                    tokenIndex += 1;

                    if (tokenIndex === tokenCount) {
                        throw 'Integer expected after "OFFSET", but the end of query text found!';
                    }

                    token = tokens[tokenIndex];
                    query.offset = parseInt(token, 10);

                    if (isNaN(query.offset)) {
                        throw 'Integer expected after "OFFSET", but "' + token + '" found!';
                    }

                    tokenIndex += 1;
                } else {
                    throw 'Unexpected token "' + token + '" found!';
                }
            }
        }

        return query;
    },

    parseGraph: function(tokens, tokenIndex, query) {
        tokenIndex++;
        var token = tokens[tokenIndex], uri;
        try {
            uri = this.parseAbsoluteIri(token);
        } catch(e) {
            throw 'Expected URI, thrown ' + e.toString();
        }
        tokenIndex++;
        token = tokens[tokenIndex];
        if (token != '{') throw 'Expected "{", having ' + token;

        for (tokenIndex++; tokenIndex < tokens.length; tokenIndex++) {
            token = tokens[tokenIndex];
            if(token == '}') break;
            if(!(token == '}' || token == '.')) {
                var parsed = this.parseTriple(tokens, tokenIndex, query, uri),
                    query = parsed.query,
                    tokenIndex = parsed.index;
            }
        }

        return {
            index: tokenIndex,
            query: query
        }
    },

    parseTriple: function(tokens, tokenIndex, query, uri) {
        var subject, predicate, object, graphs,
            token = tokens[tokenIndex],
        subject = this.parseVarOrTerm(token, query);
        if(!uri) {
            graphs = [];
        } else {
            graphs = [uri];
        }

        tokenIndex++;
        token = tokens[tokenIndex];

        predicate = this.parseVarOrTerm(token, query);

        tokenIndex++;
        token = tokens[tokenIndex];

        object = this.parseVarOrTerm(token, query);
        query.addTriple(subject, predicate, object, graphs);

        return {
            index: tokenIndex,
            query: query
        }
    },

    /**
     * Parses the given string into the absolute IRI.
     *
     * @param token String containing the IRI.
     * @return Absolute IRI parsed from the string or null if the given string does not represent
     * an absolute IRI.
     */
    parseAbsoluteIri: function (token) {
        if (!this.iriRegExp) {
            this.init();
        }

        if (this.iriRegExp.test(token) && this.absoluteIriRegExp.test(token)) {
            return token.substring(1, token.length - 1);
        } else {
            return null;
        }
    },

    /**
     * Parses the given string into the object representing an IRI.
     *
     * @param token String containing the IRI.
     * @param baseIri IRI to use for resolving relative IRIs.
     * @return Object representing the IRI parsed or null if the given string does not represent an
     * IRI.
     */
    parseIriRef: function (token, baseIri) {
        var iriRef;

        if (!this.iriRegExp) {
            this.init();
        }

        if (!this.iriRegExp.test(token)) {
            return null;
        }

//CHANGEMENT Lionel : bug qui faisait qu'une IRI avec namespace était considérée comme une absolute IRI


        if (this.absoluteIriRegExp.test(token)) {
            iriRef = token.substring(1, token.length - 1);
        } else if (!!baseIri && this.localIriRegExp.test(token)) {
// TODO: This is very basic resolution!
            iriRef = baseIri + token.substring(1, token.length - 1);
        } else if (this.localIriRegExp.test(token)) { // Shouldn't do that without baseIri...
            iriRef = token.substring(1, token.length - 1);
        } else {
            return null;
        }

//ANCIEN CODE :
        /*
         if (!baseIri || this.absoluteIriRegExp.test(token)) {
         iriRef = token.substring(1, token.length - 1);
         } else {
         // TODO: This is very basic resolution!
         iriRef = baseIri + token.substring(1, token.length - 1);
         }
         */

        return {
            'type': this.ExpressionTypes.IRI_REF,
            'value': iriRef
        };
    },

    /**
     * Parses the given string into a literal.
     *
     * @param token String containing the literal.
     * @return (Object) {type: (exports.ExpressionTypes.LITERAL|*|rdfQuery.ExpressionTypes.LITERAL), value: *, lang: (*|null), dataType: null} parsed from the string or null if the token does not represent a valid
     * literal.
     * @param query
     */
    parseLiteral: function (token, query) {
        var dataTypeIri, localName, matches, matchIndex, prefix, value;
        //token = token.match(/(?:")(.+)(?:")/)[1];
        if (!this.rdfLiteralRegExp) {
            this.init();
        }

        matches = token.match(this.rdfLiteralRegExp);

        if (matches) {
            for (matchIndex = 0; matchIndex <= 4; matchIndex += 1) {
            //ancien code
            //for (matchIndex = 1; matchIndex <= 4; matchIndex += 1) {
                value = matches[matchIndex];

                if (value) {
                    break;
                }
            }

            dataTypeIri = matches[6] || null;

            if (!dataTypeIri) {
                prefix = matches[7] || '';
                localName = matches[8] || '';

                if (prefix !== '' || localName !== '') {
                    dataTypeIri = this.expandPrefixedName(prefix, localName, query);
                } else {
                    dataTypeIri = this.DataTypes.STRING;
                }
            }

            return {
                'type': this.ExpressionTypes.LITERAL,
                'value': value,
                'lang': matches[5] || null,
                'dataType': dataTypeIri
            };
        }

        if (this.intRegExp.test(token)) {
            return {
                'type': this.ExpressionTypes.LITERAL,
                'value': token,
                'dataType': this.DataTypes.INTEGER
            };
        }

        if (this.decimalRegExp.test(token)) {
            return {
                'type': this.ExpressionTypes.LITERAL,
                'value': token,
                'dataType': this.DataTypes.DECIMAL
            };
        }

        if (this.doubleRegExp.test(token)) {
            return {
                'type': this.ExpressionTypes.LITERAL,
                'value': token,
                'dataType': this.DataTypes.DOUBLE
            };
        }

        if (this.boolRegExp.test(token)) {
            return {
                'type': this.ExpressionTypes.LITERAL,
                'value': token,
                'dataType': this.DataTypes.BOOLEAN
            };
        }

        return null;
    },

    /**
     * Parses the given string into the object representing some value found in the order by clause.
     *
     * @param token String to parse.
     * @return Object representing the order by value parsed or null if token does not represent
     * a valid order by value.
     */
    parseOrderByValue: function (token) {
        // TODO: support not only variables in ORDER BY.
        var match, prefix;

        if (!this.orderByValueRegExp) {
            this.init();
        }

        match = token.match(this.orderByValueRegExp);

        if (match) {
            prefix = match[1];

            if (!prefix) {
                return {
                    'type': this.ExpressionTypes.VAR,
                    'value': match[0].substring(1), // remove the ? or $ in the variable
                    'order': 'ASC'
                };
            }

            return {
                'type': this.ExpressionTypes.VAR,
                'value': match[2].substring(1), // remove the ? or $ in the variable
                'order': match[1].toUpperCase()
            };
        }

        return null;
    },

    /**
     * Parses the given string into the IRI, assuming that it is a prefixed name.
     *
     * @param token String containing prefixed name.
     * @param query Query object with defined prefixes, which can be used for name expansion.
     * @return Object representing the prefixed name parsed or null if the token is not a prefixed
     * name.
     */
    parsePrefixedName: function (token, query) {
        var match, cleaned;

        //CHANGEMENTS Lionel
        //Conservait les caractères < et > dans le découpage du prefixed name...
        if (this.iriRegExp.test(token)) {
            cleaned = token.substring(1, token.length - 1);
        } else {
            cleaned = token;
        }

        if (!this.prefixedNameRegExp) {
            this.init();
        }

        match = cleaned.match(this.prefixedNameRegExp);

        if (!match) {
            return null;
        }

        return {
            'type': this.ExpressionTypes.IRI_REF,
            'value': this.expandPrefixedName(match[1], match[2], query)
        };
    },

    /**
     * Parses the given string into the string representing the prefix name.
     *
     * @param token String containing the prefix name.
     * @return Prefix name parsed or null if the given string does not contain a prefix name.
     */
    parsePrefixName: function (token) {
        if (!this.prefixRegExp) {
            this.init();
        }

        return (this.prefixRegExp.test(token)) ? token.substring(0, token.length - 1) : null;
    },

    /**
     * Returns a SPARQL variable or term represented by the given string.
     *
     * @param token String to parse into the variable or term.
     * @param query Reference to the query for which the variable or term is parsed.
     * @return Object representing the variable or a term parsed.
     */
    parseVarOrTerm: function (token, query) {
// See if it is a variable.
        var value = this.parseVar(token);

        if (value) {
            return value;
        }

// See if it is an IRI reference.
        value = this.parseIriRef(token, query.baseIri);

        if (value) {
            return value;
        }

// See if it is a prefixed name.
        value = this.parsePrefixedName(token, query);

        if (value) {
            return value;
        }

// See if it is a literal.
        value = this.parseLiteral(token, query);

        if (value) {
            return value;
        }

        return null;
    },

    /**
     * Parses a token into the variable.

     *
     * @param token Contains the text representing SPARQL variable.
     * @return Object representing the SPARQL variable, or null if the given token does not
     * represent a valid SPARQL variable.
     */
    parseVar: function (token) {
        if (this.varRegExp === null) {
            this.init();
        }

        if (!this.varRegExp.test(token)) {
            return null;
        }

        return {
            'type': this.ExpressionTypes.VAR,
            'value': token.substring(1) // Skip the initial '?' or '$'
        };
    },

    /**
     * Parses a token into the SPARQL verb.
     *
     * @param token String containing a SPARQL verb.
     * @param query Reference to the query for which the variable or term is parsed.
     * @return Object representing the SPARQL verb, or null if the given token does not represent a
     * valid SPARQL verb.
     */
    parseVerb: function (token, query) {
// See if it is a variable.
        var value = this.parseVar(token);

        if (value) {
            return value;
        }

// See if it is an IRI reference.
        value = this.parseIriRef(token, query.baseIri);

        if (value) {
            return value;
        }

// See if it is a prefixed name.
        value = this.parsePrefixedName(token, query);

        if (value) {
            return value;
        }

        if (token === 'a') {
            return {
                'type': this.ExpressionTypes.IRI_REF,
                'value': CONFIG.rdf.IRIs.TYPE
            };
        }

        return null;
    }
};

module.exports = {
    sparql: SPARQL
};

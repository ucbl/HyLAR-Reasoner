/**
 * Created by Spadon on 17/10/2014.
 */
var Logics = require('./Logics'),
    ReasoningEngine = require('./ReasoningEngine'),
    Utils = require('./Utils'),
    _ = require('lodash');

TrimPath = require('./TrimPathQuery'),
    rdf = require('./JswRDF'),
    owl = require('./JswOWL');

/** Allows to work with SQL representation of queries against RDF data. */
TrimQueryABox = function () {
    /** The object storing ABox data. */
    this.database = {
        ClassAssertion: [],
        ObjectPropertyAssertion: [],
        DataPropertyAssertion: []
    };

    /** The object which can be used to send queries against ABoxes. */
    this.queryLang = this.createQueryLang();
};

/** Prototype for all jsw.TrimQueryABox objects. */
TrimQueryABox.prototype = {
    processSql: function(queries) {
        var queryLang = this.createQueryLang(), responses = [];
        for (var key in queries) {
            var query = queries[key];
            responses.push(queryLang.parseSQL(query).filter(this.database));
        }
        return responses;
    },
    /**
     * Answers the given RDF query.
     *
     * @param query RDF query to answer.
     * @return Data set containing the results matching the query.
     */
    answerQuery: function (query, ontology, rules, RMethod) {
        var sql = this.createSql(query, ontology, rules, RMethod), sqlQueries = sql.split(';').slice(0,-1);
        return this.processSql(sqlQueries);
    },

    /**
     * Adds a class assertion to the database.
     *
     * @param individualIri IRI of the individual in the assertion.
     * @param classIri IRI of the class in the assertion.
     */
    addClassAssertion: function (individualIri, classIri) {
        var data = {
            individual: individualIri,
            className: classIri
        };

        if (JSON.stringify(this.database.ClassAssertion).indexOf(JSON.stringify(data)) === -1) {
            this.database.ClassAssertion.push(data);
        }
    },

    /**
     * Adds an object property assertion to the database.
     *
     * @param objectPropertyIri IRI of the object property in the assertion.
     * @param leftIndIri IRI of the left individual in the assertion.
     * @param rightIndIri IRI of the right individual in the assertion.
     */
    addObjectPropertyAssertion: function (objectPropertyIri, leftIndIri, rightIndIri) {
        var data = {
            objectProperty: objectPropertyIri,
            leftIndividual: leftIndIri,
            rightIndividual: rightIndIri
        };

        if (JSON.stringify(this.database.ObjectPropertyAssertion).indexOf(JSON.stringify(data)) === -1) {
            this.database.ObjectPropertyAssertion.push(data);
        }
    },

    /**
     * Adds data property assertion to the database.
     * @author Mehdi Terdjimi
     * @param dataPropertyIri IRI of the data property in the assertion.
     * @param leftIndIri IRI of the left individual in the assertion.
     * @param rightValue value of the data.
     */
    addDataPropertyAssertion: function (dataPropertyIri, leftIndIri, rightValue) {
        var data = {
            dataProperty: dataPropertyIri,
            leftIndividual: leftIndIri,
            rightValue: rightValue
        };

        if (JSON.stringify(this.database.DataPropertyAssertion).indexOf(JSON.stringify(data)) === -1) {
            this.database.DataPropertyAssertion.push(data);
        }
    },

    /**
     * Creates an object which can be used for sending queries against the database.
     *
     * @return Object which can be used for sending queries against the database.
     */
    createQueryLang: function () {
        return TrimPath.makeQueryLang({
            ClassAssertion: { individual: { type: 'String' },
                className: { type: 'String' },
                explicit: { type: 'Boolean' },
                obtainedFrom: { type: 'String'},
                graphs: { type: 'String' }},
            ObjectPropertyAssertion: { objectProperty: { type: 'String' },
                leftIndividual: { type: 'String' },
                rightIndividual: { type: 'String' },
                explicit: { type: 'Boolean' },
                obtainedFrom: { type: 'String'},
                graphs: { type: 'String' }},
            DataPropertyAssertion: { dataProperty: { type: 'String' },
                leftIndividual: { type: 'String' },
                rightValue: { type: 'String' },
                explicit: { type: 'Boolean' },
                obtainedFrom: { type: 'String'},
                graphs: { type: 'String' }}
        });
    },

    /** Appends a condition to the where clause based on the given expression.
     *

     * @param expr Expression to use for constructing a condition.
     * @param table Name of the table corresponding to the expression.
     * @param field Name of the field corresponding to the expression.
     */
    writeExprCondition: function(expr, table, field, where, varFields) {
        var type = expr.type,
            value = expr.value,
            varField;

        if (type === rdf.ExpressionTypes.IRI_REF || type === rdf.ExpressionTypes.LITERAL) {
            if(expr.graphs == true) {
                var values = Utils.unStringifyAddCommas(value);
                where += '(';
                for (var key in values) {
                    value = values[key].replace(/[\[\]"]/g, '');
                    where += table + '.' + field + " LIKE '" + value + "'";
                    if(key < values.length-1) where += ' OR ';
                }
                where += ') AND ';
            } else {
                if (type === rdf.ExpressionTypes.LITERAL) value = value.replace(/"/g, '\\"');
                where += table + '.' + field + "=='" + value + "' AND ";
            }
        } else if (type === rdf.ExpressionTypes.VAR) {
            varField = varFields[value];

            if (varField) {
                where += table + '.' + field + '==' + varField + ' AND ';
            } else {
                varFields[value] = table + '.' + field;
            }
        } else {
            throw 'Unknown type of expression found in the RDF query: ' + type + '!';
        }

        return {
            where: where,
            varFields: varFields
        };
    },

    /**
     * Returns an SQL representation of the given RDF query.
     *
     * @param query jsw.rdf.Query to return the SQL representation for.
     * @return string representation of the given RDF query.
     */
    createSql: function (query, ontology, R, RMethod) {
        var from, where, limit, object, objectField, objectType, orderBy, predicate, predicateType, predicateValue,
            predicateField, graphField, select, table, subjectField, table, triple, triples, tripleCount, tripleIndex, variable,
            vars, varCount, varField, varFields, varIndex, consequences, F, graphs;

        if (!RMethod) RMethod = ReasoningEngine.naive;

        if (query.statementType == 'DELETE') {
            F = this.convertAssertions();
            consequences = RMethod(new Array(), this.convertTriples(query.triples), F, R);
            query.triples = this.consequencesToTriples(consequences.fe, true).concat(
                            this.consequencesToTriples(consequences.fi, false));
            this.purgeABox();
            return this.createInsertStatement(query.triples).join('');

        } else if (query.statementType == 'INSERT') {
            F = this.convertAssertions();
            consequences = RMethod(this.convertTriples(query.triples), new Array(), F, R);
            query.triples = this.consequencesToTriples(consequences.fe, true).concat(
                            this.consequencesToTriples(consequences.fi, false));
            this.purgeABox();
            return this.createInsertStatement(query.triples).join('');

        } else if (query.statementType == 'SELECT') {
            from = '';
            where = '';
            varFields = {};
        } else {
                throw 'Statement type unrecognized.';
        }

        triples = query.triples;
        tripleCount = triples.length;

        for (tripleIndex = 0; tripleIndex < tripleCount; tripleIndex += 1) {
            triple = triples[tripleIndex];

            predicate = triple.predicate;
            object = triple.object;
            predicateType = predicate.type;
            predicateValue = predicate.value;
            objectType = object.type;
            subjectField = 'leftIndividual';
            objectField = 'rightIndividual';
            graphField = 'graphs';
            table = 't' + tripleIndex;
            graphs = {
                type: rdf.ExpressionTypes.LITERAL,
                value: Utils.stringifyNoComma(_.sortBy(query.graphs)),
                graphs: true
            };

            if (predicateValue === rdf.IRIs.TYPE) {
                from += 'ClassAssertion AS ' + table + ', ';
                subjectField = 'individual';
                objectField = 'className';
                // todo traiter le cas ou dprop n'est pas reference
            } else if (predicateValue in ontology.entities[owl.ExpressionTypes.ET_DPROP]) {
                objectField = 'rightValue';
                from += 'DataPropertyAssertion AS ' + table + ', ';
                varField = varFields[predicateValue];
                predicateField = 'dataProperty';
                if (varField) {
                    where += table + '.dataProperty==' + varField + ' AND ';
                } else {
                    varFields[predicateValue] = table + '.dataProperty';
                }

            // for now, we consider this...
            } else if (predicateType === rdf.ExpressionTypes.IRI_REF) {
                from += 'ObjectPropertyAssertion AS ' + table + ', ';
                varField = varFields[predicateValue];
                predicateField = 'objectProperty';
                if (varField) {
                    where += table + '.objectProperty==' + varField + ' AND ';
                } else {
                    varFields[predicateValue] = table + '.objectProperty';
                }
            } else {
                throw 'Unknown type of a predicate expression: ' + predicateType + '!';
            }

            var subjectCond = this.writeExprCondition(triple.subject, table, subjectField, where, varFields);
            where = subjectCond.where;
            varFields = subjectCond.varFields;

            if(predicateField) {
                var predicateCond = this.writeExprCondition(triple.predicate, table, predicateField, where, varFields);
                where = predicateCond.where;
                varFields = predicateCond.varFields;
            }

            if(graphs.value != '') {
                var graphCond = this.writeExprCondition(graphs, table, graphField, where, varFields);
                where = graphCond.where;
                varFields = graphCond.varFields;
            }

            var objectCond = this.writeExprCondition(triple.object, table, objectField, where, varFields);
            where = objectCond.where;
            varFields = objectCond.varFields;
        }

        if (tripleCount > 0) {
            from = ' FROM ' + from.substring(0, from.length - 2);
        }

        if (where.length > 0) {
            where = ' WHERE ' + where.substring(0, where.length - 5);
        }

        select = '';
        vars = query.variables;
        varCount = vars.length;

        if (varCount > 0) {
            for (varIndex = 0; varIndex < varCount; varIndex += 1) {
                variable = vars[varIndex].value;
                varField = varFields[variable];

                if (varField) {
                    select += varField + ' AS ' + variable + ', ';
                } else {
                    select += "'' AS " + variable + ', ';
                }
            }
        } else {
            for (variable in varFields) {
                if (varFields.hasOwnProperty(variable)) {
                    select += varFields[variable] + ' AS ' + variable + ', ';
                }
            }
        }

        if (select.length > 0) {
            select = select.substring(0, select.length - 2);
        } else {
            throw 'The given RDF query is in the wrong format!';
        }

        if (query.distinctResults) {
            select = 'SELECT DISTINCT ' + select;
        } else {
            select = 'SELECT ' + select;
        }

        orderBy = '';
        vars = query.orderBy;
        varCount = vars.length;

        for (varIndex = 0; varIndex < varCount; varIndex += 1) {
            variable = vars[varIndex];

            if (variable.type !== rdf.ExpressionTypes.VAR) {
                throw 'Unknown type of expression found in ORDER BY: ' + variable.type + '!';
            }

            orderBy += variable.value + ' ' + variable.order + ', ';
        }

        if (varCount > 0) {
            orderBy = ' ORDER BY ' + orderBy.substring(0, orderBy.length - 2);
        }

        limit = '';

        if (query.limit !== 0) {

            limit = ' LIMIT ';
            if (query.offset !== 0) {
                limit += query.offset + ', ';
            }
            limit += query.limit;
        } else if (query.offset !== 0) {
            limit = ' LIMIT ' + query.offset + ', ALL';
        }

        return select + from + where + orderBy + limit + ';';
    },

    /**
     * Convert JSW assertion facts into formal Logics.js facts
     * @author Mehdi Terdjimi
     */
    convertAssertions: function() {
        var assertion,
            facts = [],
            rdfType = rdf.IRIs.TYPE;

        for(var key in this.database.ClassAssertion) {
            assertion = this.database.ClassAssertion[key];
            facts.push(
                new Logics.fact(rdfType,
                    assertion.individual,
                    assertion.className,
                    Utils.unStringifyAddCommas(assertion.obtainedFrom),
                    Utils.booleize(assertion.explicit),
                    Utils.unStringifyAddCommas(assertion.graphs)))
        }

        for(var key in this.database.ObjectPropertyAssertion) {
            assertion = this.database.ObjectPropertyAssertion[key];
            facts.push(
                new Logics.fact(assertion.objectProperty,
                    assertion.leftIndividual,
                    assertion.rightIndividual,
                    Utils.unStringifyAddCommas(assertion.obtainedFrom),
                    Utils.booleize(assertion.explicit),
                    Utils.unStringifyAddCommas(assertion.graphs)))
        }

        for(var key in this.database.DataPropertyAssertion) {
            assertion = this.database.DataPropertyAssertion[key];
            facts.push(
                new Logics.fact(assertion.dataProperty,
                    assertion.leftIndividual,
                    assertion.rightValue,
                    Utils.unStringifyAddCommas(assertion.obtainedFrom),
                    Utils.booleize(assertion.explicit),
                    Utils.unStringifyAddCommas(assertion.graphs)))
        }

        return facts;
    },

    /**
     * Convert JSW triples into formal Logics.js facts
     * @author Mehdi Terdjimi
     */
    convertTriples: function(triples) {
        var sub, pred, obj, graphs,
            newFacts = [];
        for(var key in triples) {
            var triple = triples[key];
            sub = triple.subject;
            pred = triple.predicate;
            obj = triple.object;
            graphs = triple.graphs;
            newFacts.push(new Logics.fact(pred.value, sub.value, obj.value, [], true, graphs));
        }

        return newFacts;
    },

    /** Used to suit JSW requirements
     *
     * @param consequences
     * @returns {Array}
     */
    consequencesToTriples: function(consequences, explicit) {
        var triples = [];
        for(var key in consequences) {
            var fact = consequences[key];
            if(fact.rightIndividual.match(/"[^"]*"/g)) {
                triples.push({
                    subject: {
                        value: fact.leftIndividual,
                        type: rdf.ExpressionTypes.IRI_REF
                    },
                    predicate : {
                        value: fact.name,
                        type: rdf.ExpressionTypes.IRI_REF
                    },
                    object: {
                        value: fact.rightIndividual,
                        type: rdf.ExpressionTypes.LITERAL
                    },
                    explicit: explicit,
                    obtainedFrom: fact.obtainedFrom,
                    graphs: fact.graphs
                });
            } else {
                triples.push({
                    subject: {
                        value: fact.leftIndividual,
                        type: rdf.ExpressionTypes.IRI_REF
                    },
                    predicate : {
                        value: fact.name,
                        type: rdf.ExpressionTypes.IRI_REF
                    },
                    object: {
                        value: fact.rightIndividual,
                        type: rdf.ExpressionTypes.IRI_REF
                    },
                    explicit: explicit,
                    obtainedFrom: fact.obtainedFrom,
                    graphs: fact.graphs
                });
            }
        }
        return triples;
    },

    createInsertStatement: function(triples) {
        var tuples, statement,
            insert = 'INSERT',
            into = ' INTO ',
            values = ' VALUES',
            statements = [],
            table;

        for (var tripleKey in triples) {
            var triple = triples[tripleKey];
            // If it is an assertion... //todo proposer une meilleure lisibilit�
            if (triple.predicate.value == rdf.IRIs.TYPE) {
                table = "ClassAssertion ('individual', 'className', 'explicit', 'obtainedFrom', 'graphs')";
                tuples = " ('" + triple.subject.value + "', '" + triple.object.value + "', '" + triple.explicit + "', '" + Utils.stringifyNoComma(triple.obtainedFrom) + "', '" + Utils.stringifyNoComma(_.sortBy(triple.graphs)).replace(/"/g, '\\"') + "')";
            } else if (triple.predicate.type == rdf.ExpressionTypes.IRI_REF && triple.object.type == rdf.ExpressionTypes.IRI_REF) {
                table = "ObjectPropertyAssertion ('objectProperty', 'leftIndividual', 'rightIndividual', 'explicit', 'obtainedFrom', 'graphs')";
                tuples = " ('" + triple.predicate.value + "', '" + triple.subject.value + "', '" + triple.object.value + "', '" + triple.explicit + "', '" + Utils.stringifyNoComma(triple.obtainedFrom) + "', '" + Utils.stringifyNoComma(_.sortBy(triple.graphs)).replace(/"/g, '\\"') + "')";
            } else if (triple.predicate.type == rdf.ExpressionTypes.IRI_REF && triple.object.type == rdf.ExpressionTypes.LITERAL) {
                table = "DataPropertyAssertion ('dataProperty', 'leftIndividual', 'rightValue', 'explicit', 'obtainedFrom', 'graphs')";
                tuples = " ('" + triple.predicate.value + "', '" + triple.subject.value + "', '" + triple.object.value + "', '" + triple.explicit + "', '" + Utils.stringifyNoComma(triple.obtainedFrom) + "', '" + Utils.stringifyNoComma(_.sortBy(triple.graphs)).replace(/"/g, '\\"') + "')";
            } else {
                throw 'Unrecognized assertion type.';
            }

            statement = insert + into + table + values + tuples + ";";
            statements.push(statement);
        }
        return statements;
    },

    purgeABox: function() {
        this.database.ClassAssertion = [];
        this.database.DataPropertyAssertion = [];
        this.database.ObjectPropertyAssertion = [];
    }

};


module.exports = {
    trimQueryABox: TrimQueryABox
};

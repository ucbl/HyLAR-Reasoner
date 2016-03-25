/**
 * Created by pc on 27/01/2016.
 */

var Fact = require('./Fact');
var Logics = require('./Logics');

Solver = {

    evaluateRuleSet: function(rs, facts) {
        var newCons, cons = [];
        for (var key in rs) {
            newCons = this.evaluateThroughRestriction(rs[key], facts);
            cons = Logics.uniques(cons, newCons);
        }
        return cons;
    },

    evaluateThroughRestriction: function(rule, facts) {
        var causesToMap, i = 0,
            consequences = [];
        rule.orderCausesByMostRestrictive();
        causesToMap = [rule.causes[i]];

        while (i < rule.causes.length) {
            causesToMap = this.replaceNextCauses(causesToMap, rule.causes[i+1], facts);
            i++;
        }

        for (var i = 0; i < causesToMap.length; i++) {
            for (var j = 0; j < rule.consequences.length; j++) {
                consequences.push(this.replaceMapping(causesToMap[i], rule.consequences[j]));
            }
        }

        return consequences;
    },

    replaceNextCauses: function(currentCauses, nextCause, facts) {
        var replacedNextCauses = [],
            mappings = [];
        for (var i = 0; i < currentCauses.length; i++) {
            for (var j = 0; j < facts.length; j++) {
                var mapping = currentCauses[i].mapping,
                    replacedNextCause,
                    newMapping;
                if (mapping === undefined) {
                    mapping = {};
                }

                newMapping = this.factMatchesCause(facts[j], currentCauses[i], mapping);
                if (newMapping) {
                    if (nextCause) {
                        replacedNextCause = this.replaceMapping(newMapping, nextCause);
                        replacedNextCause.mapping = newMapping;
                        replacedNextCauses.push(replacedNextCause);
                    } else {
                        mappings.push(newMapping);
                    }
                }
            }
        }

        if(nextCause) {
            return replacedNextCauses;
        } else {
            return mappings;
        }
    },

    factMatchesCause: function(fact, cause, mapping) {
        var localMapping = {}; // Generates new mapping

        if (Logics.isVariable(cause.subject)) {
            if (mapping[cause.subject] && (mapping[cause.subject] != fact.subject)) {
                return false;
            } else {
                localMapping[cause.subject] = fact.subject;
            }
        } else {
            if (fact.subject != cause.subject) {
                return false;
            }
        }

        if (Logics.isVariable(cause.predicate)) {
            if (mapping[cause.predicate] && (mapping[cause.predicate] != fact.predicate)) {
                return false;
            } else {
                localMapping[cause.predicate] = fact.predicate;
            }
        } else {
            if (fact.predicate != cause.predicate) {
                return false;
            }
        }

        if (Logics.isVariable(cause.object)) {
            if (mapping[cause.object] && (mapping[cause.object] != fact.object)) {
                return false;
            } else {
                localMapping[cause.object] = fact.object;
            }
        } else {
            if (fact.object != cause.object) {
                return false;
            }
        }

        for (var key in mapping) {
            localMapping[key] = mapping[key];
        }

        return localMapping;
    },

    replaceMappingOnElement: function(elem, mapping) {
        if(Logics.isVariable(elem)) {
            if (mapping[elem] !== undefined) {
                return mapping[elem]
            }
        }
        return elem;
    },

    replaceMapping: function(mapping, cause) {
        var consequence = new Fact();
        if (!mapping) {
            return cause;
        }

        consequence.subject = this.replaceMappingOnElement(cause.subject, mapping);
        consequence.predicate = this.replaceMappingOnElement(cause.predicate, mapping);
        consequence.object = this.replaceMappingOnElement(cause.object, mapping);

        return consequence;
    }

    /*evaluateRuleSetUsingConstruct: function (rs, facts) {
        var newConsPromises = [],
            cons = [];

        for (var key in rs) {
            newConsPromises.push(this.evaluateUsingConstruct(rs[key], facts));
        }
        return q.all(newConsPromises)
            .then(function(resultsArray) {
                for (var i = 0; i < resultsArray.length; i++) {
                    cons = Logics.uniques(cons, resultsArray[i]);
                }
                return cons;
            });
    },

    evaluateUsingConstruct: function (rule, facts) {

        var turtleFacts = ParsingInterface.factsToTurtle(facts),
            turtleRule = ParsingInterface.ruleToTurtle(rule),

            deferred = q.defer();

        rdfstore.create(function (err, store) {
            store.execute('INSERT DATA { ' + turtleFacts + ' }',
                function (err, results) {
                    store.execute('CONSTRUCT { ' + turtleRule.consequences + ' } WHERE { ' + turtleRule.causes + ' }',
                        function (err, results) {
                            deferred.resolve(ParsingInterface.triplesToFacts(results.triples, false));
                        });
                });
        });

        return deferred.promise;

    },*/

    /*replaceMappings: function(mapping, rule, matchingFacts) {
        var consequences = [],
            consequence;
        for (var i = 0; i < rule.consequences.length; i++) {
            consequence = this.replaceMapping(mapping, rule.consequences[i]);
            if(consequence) {
                consequence.causedBy = [];
                consequence.causedBy.push(matchingFacts);
                consequence.explicit = false;
                consequences.push(consequence);
            }
        }
        return consequences;
    },

    replaceMapping: function(mapping, ruleFact) {
        var consequence = new Fact();
        if (!mapping) {
            return false;
        }

        if(Logics.isVariable(ruleFact.subject)) {
            if (mapping[ruleFact.subject] !== undefined) {
                consequence.subject = mapping[ruleFact.subject]
            } else {
                return false;
            }
        }  else {
            consequence.subject = ruleFact.subject;
        }

        if(Logics.isVariable(ruleFact.predicate)) {
            if (mapping[ruleFact.predicate] !== undefined) {
                consequence.predicate = mapping[ruleFact.predicate]
            } else {
                return false;
            }
        } else {
            consequence.predicate = ruleFact.predicate;
        }

        if(Logics.isVariable(ruleFact.object)) {
            if (mapping[ruleFact.object] !== undefined) {
                consequence.object = mapping[ruleFact.object]
            } else {
                return false;
            }
        }  else {
            consequence.object = ruleFact.object;
        }

        return consequence;
    },*/
};

module.exports = Solver;
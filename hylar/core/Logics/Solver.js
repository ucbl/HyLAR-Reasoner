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
            var causedBy = [];
            for (var k = 0; k < rule.causes.length; k++) {
                causedBy.push(this.replaceMapping(causesToMap[i], rule.causes[k]).toString());
            }
            for (var j = 0; j < rule.consequences.length; j++) {
                consequences.push(this.replaceMapping(causesToMap[i], rule.consequences[j], causedBy));
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

    replaceMapping: function(mapping, unReplacedFact, causedBy) {
        var replacedFact = new Fact(),
            replacedCauses = [];
        if (mapping == {}) {
            return unReplacedFact;
        }

        if (causedBy) {
            replacedFact.causedBy = [causedBy];
            replacedFact.explicit = false;
        }

        replacedFact.subject = this.replaceMappingOnElement(unReplacedFact.subject, mapping);
        replacedFact.predicate = this.replaceMappingOnElement(unReplacedFact.predicate, mapping);
        replacedFact.object = this.replaceMappingOnElement(unReplacedFact.object, mapping);

        return replacedFact;
    }
};

module.exports = Solver;
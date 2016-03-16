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
        var pastConsequences = [],
            newConsequences,
            matchingFacts = {};

        rule.orderCausesByMostRestrictive();

        while ((newConsequences === undefined) || (newConsequences.length > pastConsequences.length)) {
            var j = 0,
                mapping = {};

            if (newConsequences === undefined) {
                newConsequences = [];
            } else {
                pastConsequences = newConsequences;
            }

            for (var i = 0; i < facts.length; i++) {
                var fact = facts[i],
                    cause = rule.causes[j],
                    consequences,
                    currentMatchingFacts = [];

                if(matchingFacts[fact.toString()] === undefined) {
                    matchingFacts[fact.toString()] = [];
                }

                if (matchingFacts[fact.toString()][j] === undefined) {
                    if (this.factMatchesCause(fact, cause, mapping)) { // updates mapping
                        matchingFacts[fact.toString()][j] = cause.toString();
                        currentMatchingFacts.push(fact);
                        i = -1; j++;
                    }
                }

                consequences = this.replaceMappings(mapping, rule, currentMatchingFacts);

                if (consequences.length > 0) {
                    newConsequences = Logics.uniques(pastConsequences, consequences);
                    break;
                }
            }
        }

        return newConsequences;
    },

    factMatchesCause: function(fact, cause, mapping) {
        var localMapping = {}; // so that global mapping is not altered in case of false returning

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

        for (var key in localMapping) {
            mapping[key] = localMapping[key];
        }
        return true;
    },

    replaceMappings: function(mapping, rule, matchingFacts) {
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
    }
};

module.exports = Solver;
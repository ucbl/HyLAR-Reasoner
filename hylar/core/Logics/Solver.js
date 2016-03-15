/**
 * Created by pc on 27/01/2016.
 */

var Fact = require('./Fact');
var Logics = require('./Logics');
var Combinatorics = require('js-combinatorics');

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
                    consequences;

                if(matchingFacts[fact.toString()] === undefined) {
                    matchingFacts[fact.toString()] = [];
                }

                if (matchingFacts[fact.toString()][j] === undefined) {
                    if (this.factMatchesCause(fact, cause, mapping)) { // updates mapping
                        matchingFacts[fact.toString()][j] = cause.toString();
                        i = -1; j++;
                    }
                }

                consequences = this.replaceMappings(mapping, rule);

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

    evaluate: function(rule, facts) {
        var conjunctions,
            results = [],
            consequences,
            conjunction,
            mapping;

        facts = Logics.restrictFactSet(rule, facts);
        conjunctions = this.getConjunctions(facts, rule.causes.length);

        for (var i = 0; i < conjunctions.length; i++) {
            mapping = {};
            conjunction = conjunctions[i];

            // Maps rule causes variables to the actual conjunction
            for (var j = 0; j < rule.causes.length; j++) {
                mapping = this.mapValues(conjunction[j], rule.causes[j], mapping);
            }

            // Replaces variable mappings on the rule consequences
            consequences = this.replaceMappings(mapping, rule);

            // Set causes if necessary (todo)
            for (var j = 0; j < consequences.length; j++) {
                consequences[j].setCauses(conjunction);
            }

            results = Logics.mergeFactSets(results, consequences);
        }

        return results;
    },

    mapValues: function(fact, ruleFact, mapping) {
        var factRows = [fact.subject, fact.predicate, fact.object],
            ruleFactRows = [ruleFact.subject, ruleFact.predicate, ruleFact.object];
        
        for (var i = 0; i < 3; i++) {
            if (Logics.isVariable(ruleFactRows[i])) {
                if (!this.alreadyMapped(mapping, ruleFactRows[i]) && this.mapsNothing(mapping, factRows[i])) {
                    mapping[ruleFactRows[i]] = factRows[i];
                } else if (this.mapsNothing(mapping, factRows[i])) {
                    return false;
                }
                if(!this.alreadyMapped(mapping, ruleFactRows[i])) {
                    return false;
                }
            } else if ((ruleFactRows[i] != factRows[i])) {
                return false;
            }
        }

        return mapping;
    },

    replaceMappings: function(mapping, rule) {
        var consequences = [],
            consequence;
        for (var i = 0; i < rule.consequences.length; i++) {
            consequence = this.replaceMapping(mapping, rule.consequences[i]);
            if(consequence) {
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
    },

    alreadyMapped: function(mapping, index) {
        return (mapping[index] !== undefined);
    },

    mapsNothing: function(mapping, value) {
        for (var index in mapping) {
            if(mapping[index] == value) {
                return false;
            }
        }
        return true;
    },

    getConjunctions: function(facts, length) {
        return Combinatorics.baseN(facts, length).toArray();
    }
};

module.exports = Solver;
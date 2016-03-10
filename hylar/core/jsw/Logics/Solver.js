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
            newCons = this.evaluate(rs[key], facts);
            cons = Logics.mergeFactSets(cons, newCons);
        }
        return cons;
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
            if (this.isVariable(ruleFactRows[i])) {
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

        if(this.isVariable(ruleFact.subject)) {
            if (mapping[ruleFact.subject] !== undefined) {
                consequence.subject = mapping[ruleFact.subject]
            } else {
                return false;
            }
        }  else {
            consequence.subject = ruleFact.subject;
        }

        if(this.isVariable(ruleFact.predicate)) {
            if (mapping[ruleFact.predicate] !== undefined) {
                consequence.predicate = mapping[ruleFact.predicate]
            } else {
                return false;
            }
        } else {
            consequence.predicate = ruleFact.predicate;
        }

        if(this.isVariable(ruleFact.object)) {
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

    objectExistsIn: function(array, value) {
        return (JSON.stringify(array).indexOf(JSON.stringify(value)) > -1);
    },

    isVariable: function(str) {
        try {
            return (str.indexOf('?') === 0);
        } catch(e) {
            return false;
        }
    },

    getConjunctions: function(facts, length) {
        return Combinatorics.baseN(facts, length).toArray();
    }
};

module.exports = Solver;
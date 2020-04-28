/**
 * Created by mt on 21/12/2015.
 */

const Utils = require('../Utils');

/**
 * Rule in the form subClassOf(a, b) ^ subClassOf(b, c) -> subClassOf(a, c)
 * i.e. conjunction of facts
 * @param slf set of (left side) conjunctive facts
 * @param ra the consequence facts
 * @constructor
 */
Rule = function(slf, srf, name, ruleType = Rule.types.CUSTOM) {
    this.name = name;
    this.causes = [];
    this.operatorCauses = [];
    this.consequences = srf;
    this.constants = [];
    this.dependentRules = [];
    this.matches = {};
    this.type = ruleType

    for (var i = 0; i < slf.length; i++) {
        if (!slf[i].operatorPredicate) {
            this.causes.push(slf[i]);
        } else {
            this.operatorCauses.push(slf[i]);
        }
    }

    for (var i = 0; i < this.causes.length; i++) {
        this.constants = Utils.uniques(this.constants, slf[i].constants);
    }
    for (var i = 0; i < this.consequences.length; i++) {
        this.constants = Utils.uniques(this.constants, srf[i].constants);
    }
    this.orderCausesByMostRestrictive();
};

Rule.types = {
    CUSTOM: "CUSTOM",
    OWL2RL: "OWL2RL",
    RDFS: "RDFS"
}

Rule.prototype = {
    /**
     * Convenient method to stringify a rule.
     * @returns {string}
     */
    toString: function() {
        var factConj = '';
        for(var key in this.causes) {
            factConj += ' ^ ' + this.causes[key].toString().substring(1).replace(/,/g, '');
        }
        for(var key in this.operatorCauses) {
            factConj += ' ^ ' + this.operatorCauses[key].toString().substring(1).replace(/,/g, '');
        }
        return factConj.substr(3) + ' -> ' + this.consequences.toString().substring(1).replace(/,/g, '');
    },

    setName: function(name) {
        this.name = name;
    },

    /**
     * Orders rule causes (inplace) from the most to the least restrictive.
     * The least a cause have variables, the most it is restrictive.
     */
    orderCausesByMostRestrictive: function() {
        var orderedCauses = [],
            totalConstantOccurences = [];

        for (var i = 0; i < this.causes.length; i++) {
            var cause = this.causes[i],
                constantOccurences = 0;
            if (!(cause.subject.indexOf('?') === 0)) {
                constantOccurences++;
            }
            if (!(cause.predicate.indexOf('?') === 0)) {
                constantOccurences++;
            }
            if (!(cause.object.indexOf('?') === 0)) {
                constantOccurences++;
            }
            totalConstantOccurences.push({
                cause: cause,
                constantOccurences: constantOccurences
            });
        }

        totalConstantOccurences = totalConstantOccurences.sort(function(a, b) {
            var x = a.constantOccurences; var y = b.constantOccurences;
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });

        for(var i = 0; i < totalConstantOccurences.length; i++) {
            orderedCauses.push(totalConstantOccurences[i].cause);
        }

        this.causes = orderedCauses;
    },

    dependsOn: function(rule) {
        for (var i = 0; i < rule.consequences.length; i++) {
            var cons = rule.consequences[i];
            for (var j = 0; j < this.causes.length; j++) {
                var cause = this.causes[j];
                if (cause.hasSimilarPatternWith(cons)) {
                    return true;
                }
            }
        }
        return false;
    },

    addDependentRule: function(rule) {
        if (!(rule in this.dependentRules)) {
            this.dependentRules.push(rule);
        }
    },

    toCHR: function() {
        var factConj = '', mapping = {};
        for(var key in this.causes) {
            factConj += ', ' + this.causes[key].toCHR(mapping);
        }
        for(key in this.operatorCauses) {
            factConj += ', ' + this.operatorCauses[key].toCHR(mapping);
        }        
        factConj = factConj.substring(2) + ' ==> ';
        
        for(key in this.consequences) {
            factConj += this.consequences[key].toCHR(mapping) + ', ';
        }
        factConj = factConj.substring(0,factConj.length-2);
        
        return factConj;
    }
};

module.exports = Rule;
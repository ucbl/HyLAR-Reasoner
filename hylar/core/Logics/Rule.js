/**
 * Created by mt on 21/12/2015.
 */

var Utils = require('../Utils');

/**
 * Rule in the form subClassOf(a, b) ^ subClassOf(b, c) -> subClassOf(a, c)
 * i.e. conjunction of facts
 * @param slf set of (left side) conjunctive facts
 * @param ra the consequence facts
 * @constructor
 */
Rule = function(slf, srf) {
    this.causes = slf;
    this.consequences = srf;
    this.constants = [];
    for (var i = 0; i < slf.length; i++) {
        this.constants = Utils.uniques(this.constants, slf[i].constants);
    }
    for (var i = 0; i < srf.length; i++) {
        this.constants = Utils.uniques(this.constants, srf[i].constants);
    }
    this.classifyCauses();
    this.orderCausesByMostRestrictive();
};

Rule.prototype = {
    /**
     * Convenient method to stringify a rule.
     * @returns {string}
     */
    toString: function() {
        var factConj = '';
        for(var key in this.causes) {
            factConj += ' ^ ' + this.causes[key].toString();
        }
        return factConj.substr(3) + ' -> ' + this.consequences.toString();
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
            if (a.constantOccurences > b.constantOccurences) {
                return 1;
            }
            if (a.constantOccurences < b.constantOccurences) {
                return -1;
            }
            return 0;
        });

        for(var i = 0; i < totalConstantOccurences.length; i++) {
            orderedCauses.push(totalConstantOccurences[i].cause);
        }

        this.causes = orderedCauses;
    },

    classifyCauses: function() {
        var nonOperators = [],
            operators = [];
        for (var i = 0; i < this.causes.length; i++) {
            if (!this.causes[i].operatorPredicate) {
                nonOperators.push(this.causes[i]);
            } else {
                operators.push(this.causes[i]);
            }
        }
        this.nonOperatorCauses = nonOperators;
        this.operatorCauses = operators;
    },

    addCause: function(cause) {
        var newRule = new Rule(this.causes.concat([cause]), this.consequences);
        this.causes = newRule.causes;
        this.consequences = newRule.consequences;
        this.constants = newRule.constants;
    },

    addConsequence: function(cons) {
        var newRule = new Rule(this.causes, this.consequences.concat([cons]));
        this.causes = newRule.causes;
        this.consequences = newRule.consequences;
        this.constants = newRule.constants;
    },


    // @todo
    getIdbPredicates: function() {

    },

    // @todo
    getEdbPredicates: function() {

    }
};

module.exports = Rule;
/**
 * Created by mt on 21/12/2015.
 */

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
    }
};

module.exports = Rule;
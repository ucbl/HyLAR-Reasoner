/**
* Created by Spadon on 17/10/2014.
*/

const ReasoningEngine = require('./ReasoningEngine')

/**
 * The core reasoner or HyLAR.
 */

module.exports = {

    updateRuleDependencies: function(ruleSet) {
        for (var i = 0; i < ruleSet.length; i++) {
            var rule = ruleSet[i];
            for (var j = 0; j < ruleSet.length; j++) {
                var depRule = ruleSet[j];
                if (rule.dependsOn(depRule)) {
                    depRule.addDependentRule(rule);
                }
            }
        }
    },

    /**
     * Evaluates knowledge base update using
     * advanced reasoning algorithms (incremental, tag-based).
     * @param fI The facts to insert
     * @param fD The facts to delete
     * @param F The KB
     * @param alg The reasoning algorithm (function)
     * @returns {*}
     */
    evaluate: function(fI, fD, F, alg, rules) {
        if (!alg) alg = ReasoningEngine.incremental;
        return alg(fI, fD, F, rules);
    },

    /**
     * Specifies the reasoning engine used.
     */
    engine: ReasoningEngine,

    /**
     * Specifies the behavior of the reasoning engine
     * (algorithm currently chosen).
     */
    process: {
        it: {
            none: null,
            incrementally: ReasoningEngine.incremental,
            tagBased: ReasoningEngine.tagging
        }
    }
};
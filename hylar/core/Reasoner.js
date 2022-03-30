/**
* Created by Spadon on 17/10/2014.
*/

import ReasoningEngine from './ReasoningEngine'

/**
 * The core reasoner or HyLAR.
 */

var Reasoner = {

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
// module.exports = Reasoner;
// for (var [prop, func] of Object.entries(Reasoner)) {
//     module.exports[prop] = func;
// }
export default Reasoner;
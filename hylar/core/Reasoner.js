/**
* Created by Spadon on 17/10/2014.
*/

var ReasoningEngine = require('./ReasoningEngine'),
    Logics = require('./Logics/Logics');

var q = require('q');

/**
 * The core reasoner or HyLAR.
 */

module.exports = {

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
            incrementally: ReasoningEngine.incremental,
            incrementallyBf: ReasoningEngine.incrementalBf,
            naively: ReasoningEngine.naive,
            tagBased: ReasoningEngine.tagging
        }
    }
};

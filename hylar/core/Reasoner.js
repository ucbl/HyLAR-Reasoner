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
        var deferred = q.defer(),
            evaluationResults, inconsistencies;
        if (!alg) alg = ReasoningEngine.incremental;

        evaluationResults = alg(fI, fD, F, rules);
        inconsistencies = Logics.getInconsistencies(evaluationResults.additions);

        console.notify('Evaluation finished.');
        if (inconsistencies.length > 0) console.warn(inconsistencies.length + ' inconsistency(ies) detected.');
        console.notify(evaluationResults.additions.length + ' additions, ' + evaluationResults.deletions.length + ' deletions.');

        deferred.resolve(evaluationResults);

        return deferred.promise;
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

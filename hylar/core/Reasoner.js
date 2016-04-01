/**
* Created by Spadon on 17/10/2014.
*/

var OWL2RL = require('./OWL2RL'),
    ReasoningEngine = require('./ReasoningEngine');

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
    evaluate: function(fI, fD, F, alg) {
        var deferred = q.defer(),
            evaluationResults;
        if (!alg) alg = ReasoningEngine.incremental;

        evaluationResults = alg(fI, fD, F, OWL2RL.rules);

        console.notify('Evaluation finished.');
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
            naively: ReasoningEngine.naive,
            tagBased: ReasoningEngine.tagging
        }
    }
};

/**
* Created by Spadon on 17/10/2014.
*/

var OWL2RL = require('./OWL2RL'),
    ReasoningEngine = require('./ReasoningEngine');

var q = require('q');

module.exports = {
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

    engine: ReasoningEngine,

    process: {
        it: {
            incrementally: ReasoningEngine.incremental,
            naively: ReasoningEngine.naive,
            tagBased: ReasoningEngine.tagging
        }
    }
};

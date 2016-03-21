/**
* Created by Spadon on 17/10/2014.
*/

var OWL2RL = require('./OWL2RL'),
    ReasoningEngine = require('./ReasoningEngine');

var q = require('q');

module.exports = {
    evaluate: function(fI, fD, F, alg) {
        var deferred = q.defer();
        if (!alg) alg = ReasoningEngine.incremental;
        deferred.resolve(alg(fI, fD, F, OWL2RL.rules));
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

/**
 * Created by pc on 27/01/2016.
 */

var Fact = require('./Fact');
var Logics = require('./Logics');

/**
 * Core solver used to evaluate rules against facts
 * using pattern matching mechanisms.
 */

Solver = {

    /**
     * Evaluates a set of rules over a set of facts.
     * @param rs
     * @param facts
     * @returns Array of the evaluation.
     */
    evaluateRuleSet: function(rs, facts) {
        var newCons, cons = [];
        for (var key in rs) {
            newCons = this.evaluateThroughRestriction(rs[key], facts);
            cons = Logics.uniques(cons, newCons);
        }
        return cons;
    },

    /**
     * Evaluates a rule over a set of facts through
     * restriction of the rule's causes.
     * @param rule
     * @param facts
     * @returns {Array}
     */
    evaluateThroughRestriction: function(rule, facts) {
        var causesToMap, i = 0,
            consequences = [],
            mappingList = [];

        rule.orderCausesByMostRestrictive();
        causesToMap = [rule.causes[i]]; // Init with first cause

        while (i < rule.causes.length) {
            causesToMap = this.substituteNextCauses(causesToMap, rule.causes[i+1], facts);
            i++;
        }

        // The loop is over, all mappings have been returned
        mappingList = causesToMap;

        for (var i = 0; i < mappingList.length; i++) {
            var causedBy = [],
                consequenceGraphs = [];
            // Replace mappings on all causes
            for (var k = 0; k < rule.causes.length; k++) {
                causedBy.push(this.substituteFactVariablesWithMapping(mappingList[i], rule.causes[k]).toString());
                consequenceGraphs = Logics.uniques(consequenceGraphs, mappingList[i].graphs);
            }
            // Replace mappings on all consequences
            for (var j = 0; j < rule.consequences.length; j++) {
                consequences.push(this.substituteFactVariablesWithMapping(mappingList[i], rule.consequences[j], causedBy, consequenceGraphs));
            }
        }

        return consequences;
    },

    /**
     * Updates the mapping of the current cause
     * given the next cause of a rule, over a
     * set of facts.
     * @param currentCauses
     * @param nextCause
     * @param facts
     * @returns {Array}
     */
    substituteNextCauses: function(currentCauses, nextCause, facts) {
        var substitutedNextCauses = [],
            mappings = [];

        for (var i = 0; i < currentCauses.length; i++) {

            for (var j = 0; j < facts.length; j++) {

                // Get the mapping of the current cause ...
                var mapping = currentCauses[i].mapping,
                    substitutedNextCause,
                    newMapping;
                // ... or build a fresh one if it does not exist
                if (mapping === undefined) {
                    mapping = {};
                }

                // Update the mapping using pattern matching
                newMapping = this.factMatchesCause(facts[j], currentCauses[i], mapping);

                // If the current fact matches the current cause ...
                if (newMapping) {
                    // If there are other causes to be checked...
                    if (nextCause) {
                        // Substitute the next cause's variable with the new mapping
                        substitutedNextCause = this.substituteFactVariablesWithMapping(newMapping, nextCause);
                        substitutedNextCause.mapping = newMapping;
                        substitutedNextCauses.push(substitutedNextCause);
                    } else {
                        // Otherwise, add the new mapping to the global mapping array
                        mappings.push(newMapping);
                    }
                }
            }
        }

        if(nextCause) {
            return substitutedNextCauses;
        } else {
            return mappings;
        }
    },

    /**
     * Returns a new or updated mapping if a fact matches a cause,
     * return false otherwise.
     * @param fact
     * @param cause
     * @param mapping
     * @returns {*}
     */
    factMatchesCause: function(fact, cause, mapping) {
        var localMapping = {};

        // Checks and update localMapping if matches
        if (!this.factElemMatchesCauseElem(fact.subject, cause.subject, mapping, localMapping)) {
            return false;
        }
        if (!this.factElemMatchesCauseElem(fact.predicate, cause.predicate, mapping, localMapping)) {
            return false;
        }
        if (!this.factElemMatchesCauseElem(fact.object, cause.object, mapping, localMapping)) {
            return false;
        }

        // Merges local and global mapping
        for (var key in mapping) {
            localMapping[key] = mapping[key];
        }

        // Updates graph references
        if (localMapping.graphs) {
            localMapping.graphs = Logics.uniques(localMapping.graphs, fact.graphs);
        } else {
            localMapping.graphs = [];
        }

        // The new mapping is updated
        return localMapping;
    },

    factElemMatchesCauseElem: function(factElem, causeElem, globalMapping, localMapping) {
        if (Logics.isVariable(causeElem)) {
            if (globalMapping[causeElem] && (globalMapping[causeElem] != factElem)) {
                return false;
            } else {
                localMapping[causeElem] = factElem;
            }
        } else {
            if (factElem != causeElem) {
                return false;
            }
        }

        return true;
    },

    /**
     * Substitutes an element given the mapping.
     * @param elem
     * @param mapping
     * @returns {*}
     */
    substituteElementVariablesWithMapping: function(elem, mapping) {
        if(Logics.isVariable(elem)) {
            if (mapping[elem] !== undefined) {
                return mapping[elem]
            }
        }
        return elem;
    },

    /**
     * Substitutes fact's variable members (sub, pred, obj)
     * given the mapping.
     * @param mapping
     * @param notYetSubstitutedFact
     * @param causedBy
     * @param graphs
     * @returns {*}
     */
    substituteFactVariablesWithMapping: function(mapping, notYetSubstitutedFact, causedBy, graphs) {
        var substitutedFact = new Fact();

        if (mapping == {}) {
            return notYetSubstitutedFact;
        }

        if (causedBy) {
            substitutedFact.causedBy = [causedBy];
            substitutedFact.explicit = false;
        }

        if (graphs) {
            substitutedFact.graphs = graphs;
        }

        substitutedFact.subject = this.substituteElementVariablesWithMapping(notYetSubstitutedFact.subject, mapping);
        substitutedFact.predicate = this.substituteElementVariablesWithMapping(notYetSubstitutedFact.predicate, mapping);
        substitutedFact.object = this.substituteElementVariablesWithMapping(notYetSubstitutedFact.object, mapping);

        return substitutedFact;
    },

    checkProvability: function(fact, R, C, Fe, Y, P, V, undeterminedImplicitFacts) {
        var matchedRules, consequences;

        if (Logics.addToFactSet(C, fact)) {
            return;
        }

        this.saturate(R, C, Fe, Y, P, V);

        if (Logics.uniques(P, [fact]).length == P.length) {
            return;
        }

        matchedRules = Logics.restrictRuleSet(R, [fact]);
        consequences = this.evaluateRuleSet(matchedRules, undeterminedImplicitFacts);

        for (var i = 0; i < consequences.length; i++) {
            this.checkProvability(consequences[i]);
            if (Logics.uniques(C, [fact]).length == C.length) {
                return;
            }
        }
    },

    saturate: function(R, C, Fe, Y, P, V) {
        var consequences;

        for (var i = 0; i < C.length; i++) {
            if ((Logics.uniques([C[i]], Fe).length == Fe.length) ||
                (Logics.uniques([C[i]], Y).length == Y.length)) {
                P = Logics.uniques(P, [C[i]]);
            }
        }

        for (var i = 0; i < P.length; i++) {
            if (Logics.addToFactSet(V, P[i])) {
                consequences = this.evaluateRuleSet(R, P[i]);

                for (var j = 0; j < consequences.length; j++) {
                    if (Logics.uniques([consequences[i]], C)) {
                        Logics.addToFactSet(P, consequences[j]);
                    } else {
                        Logics.addToFactSet(Y, consequences[j])
                    }
                }
            }
        }
        return;
    }
};

module.exports = Solver;
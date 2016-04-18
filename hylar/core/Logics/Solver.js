/**
 * Created by pc on 27/01/2016.
 */

var Fact = require('./Fact');
var Logics = require('./Logics');
var AnnotatedQuery = require('./AnnotatedQuery');

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
            for (var j = 0; j < rule.causes.length; j++) {
                causedBy.push(this.substituteFactVariables(mappingList[i], rule.causes[j]).toString());
                consequenceGraphs = Logics.uniques(consequenceGraphs, mappingList[i].graphs);
            }
            // Replace mappings on all consequences
            for (var j = 0; j < rule.consequences.length; j++) {
                consequences.push(this.substituteFactVariables(mappingList[i], rule.consequences[j], causedBy, consequenceGraphs));
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
                newMapping = this.factMatches(facts[j], currentCauses[i], mapping);

                // If the current fact matches the current cause ...
                if (newMapping) {
                    // If there are other causes to be checked...
                    if (nextCause) {
                        // Substitute the next cause's variable with the new mapping
                        substitutedNextCause = this.substituteFactVariables(newMapping, nextCause);
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
     * Returns a new or updated mapping if a fact matches a rule cause or consequence,
     * return false otherwise.
     * @param fact
     * @param ruleFact
     * @param mapping
     * @returns {*}
     */
    factMatches: function(fact, ruleFact, mapping) {
        var localMapping = {};

        // Checks and update localMapping if matches
        if (!this.factElemMatches(fact.subject, ruleFact.subject, mapping, localMapping)) {
            return false;
        }
        if (!this.factElemMatches(fact.predicate, ruleFact.predicate, mapping, localMapping)) {
            return false;
        }
        if (!this.factElemMatches(fact.object, ruleFact.object, mapping, localMapping)) {
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

    factElemMatches: function(factElem, causeElem, globalMapping, localMapping) {
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
    substituteFactVariables: function(mapping, notYetSubstitutedFact, causedBy, graphs) {
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

    checkProvability: function(fact, R, C, Fe, Y, P, V, IWithoutS) {
        var matchedRules, consequences,
            tuples, evalRes;

        if (!Logics.addToFactSet(C, fact)) {
            return;
        }

        this.saturate(R, C, Fe, Y, P, V);

        if (Logics.uniques(P, [fact]).length == P.length) {
            return;
        }

        tuples = this.matchHead(R, fact);

        for (var i = 0; i < tuples.length; i++) {
            evalRes = this.eval(IWithoutS, tuples[i].annotatedQuery, [], tuples[i].mapping);
            for (var j = 0; j < evalRes.length; j++) {
                for (var k = 0; k < tuples[i].rule.causes.length; k++) {
                    this.checkProvability(evalRes[j], R, C, Fe, Y, P, V, IWithoutS);
                }
                if (Logics.uniques(P, fact).length == P.length) {
                    return;
                }
            }
        }
    },

    saturate: function(R, C, Fe, Y, P, V) {
        var consequences,
            tuplesMatchBody;

        for (var i = 0; i < C.length; i++) {
            if ((Logics.uniques([C[i]], Fe).length == Fe.length) ||
                (Logics.uniques([C[i]], Y).length == Y.length)) {
                Logics.addToFactSet(P, C[i]);
            }
        }

        for (var i = 0; i < P.length; i++) {
            if (Logics.addToFactSet(V, P[i])) {
                tuplesMatchBody = this.matchBody(R, P[i]);
                //consequences = this.evaluateRuleSet(R, P[i]);

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
    },

    matchHead: function(ruleSet, fact) {
        var tuples = [],
            atom;

        for (var i = 0; i < ruleSet.length; i++) {
            var mapping = {},
                annotatedQuery = new AnnotatedQuery(),
                head = ruleSet[i].consequences[0];

            if (ruleSet[i].consequences.length > 1) {
                throw 'B/F algorithm expects unique consequences (HEAD)!';
            }

            mapping = this.factMatches(fact, head, mapping);

            if (mapping) {
                atom = new AnnotatedQuery.atom(head);
                annotatedQuery.addAtom(atom);
                tuples.push({
                    mapping: mapping,
                    rule: ruleSet[i],
                    annotatedQuery: annotatedQuery
                });
            }
        }

        return tuples;
    },

    matchBody: function(ruleSet, fact) {
        var tuples = [];

        for (var i = 0; i < ruleSet.length; i++) {
            var mapping = {}, allAtomsAreGround,
                annotatedQuery = new AnnotatedQuery();

            for (var j = 0; j < ruleSet[i].causes.length; j++) {
                mapping = this.factMatches(fact, ruleSet[i].causes[j], mapping);
                atom = new AnnotatedQuery.atom(this.substituteFactVariables(mapping, ruleSet[i].causes[j]));
                annotatedQuery.addAtom(atom);
            }
            allAtomsAreGround = true;
            for (var j = 0; j < annotatedQuery.atomsLen(); j++) {
                if (!annotatedQuery.getAtom(j).value.isGroundWith(mapping)) {
                    allAtomsAreGround = false;
                    break;
                }
            }
            if (allAtomsAreGround) {
                tuples.push({
                    mapping: (mapping || {}),
                    rule: ruleSet[i],
                    annotatedQuery: annotatedQuery
                });
            }
        }
        return tuples;
    },

    eval: function(factSetToEval, annotatedQuery, factSet, mapping) {
        var mappings = [], currentNewMapping;
        factSetToEval = Logics.minus(factSetToEval, factSet);

        for (var i = 0; i < annotatedQuery.atomsLen(); i++) {
            if (annotatedQuery.getAtom(i).annotation == 'DIFF') {
                for (var j = 0; j < factSetToEval.length; j++) {
                    currentNewMapping = this.factMatches(factSetToEval[j], annotatedQuery.getAtom(i).value, this.cloneMapping(mapping));
                    if (currentNewMapping) {
                        mappings.push(currentNewMapping);
                    }
                }
            }
        }

        return mappings;
    },

    cloneMapping: function(mapping) {
        var clone = {};
        for (var key in mapping) {
            clone[key] = mapping[key];
        }
        return clone;
    }
};

module.exports = Solver;
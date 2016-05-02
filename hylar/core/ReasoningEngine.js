/**
 * Created by Spadon on 11/09/2015.
 */

var Logics = require('./Logics/Logics'),
    Solver = require('./Logics/Solver'),
    Utils = require('./Utils');

/**
 * Reasoning engine containing incremental algorithms
 * and heuristics for KB view maintaining.
 */

ReasoningEngine = {
    /**
     * A naive reasoner that recalculates the entire knowledge base.
     * @deprecated
     * @param triplesIns
     * @param triplesDel
     * @param rules
     * @returns {{fi: *, fe: *}}
     */
    naive: function(FeAdd, FeDel, F, R) {
        var FiAdd = [], FiAddNew = [], additions, deletions,
            Fe = Logics.getOnlyExplicitFacts(F), FiAddNew = [];

        // Deletion
        if(FeDel && FeDel.length) {
            Fe = Logics.minus(Fe, FeDel);
        }

        // Insertion
        if(FeAdd && FeAdd.length) {
            Fe = Utils.uniques(Fe, FeAdd);
        }

        // Recalculation
        do {
            FiAdd = Utils.uniques(FiAdd, FiAddNew);
            FiAddNew = Solver.evaluateRuleSet(R, Utils.uniques(Fe, FiAdd));
        } while (!Logics.containsFacts(FiAdd, FiAddNew));

        additions = Utils.uniques(FeAdd, FiAdd);
        deletions = Logics.minus(F, Utils.uniques(Fe, FiAdd));

        F = Utils.uniques(Fe, FiAdd);

        return {
            additions: additions,
            deletions: deletions,
            updatedF: F
        };
    },

    /**
     * Incremental reasoning which avoids complete recalculation of facts.
     * Concat is preferred over merge for evaluation purposes.
     * @param R set of rules
     * @param F set of assertions
     * @param FeAdd set of assertions to be added
     * @param FeDel set of assertions to be deleted
     */
    incremental: function (FeAdd, FeDel, F, R) {
        var Rdel = [], Rred, Rins = [],
            FiDel = [], FiAdd = [],
            FiDelNew = [], FiAddNew = [],
            superSet = [],

            additions, deletions,

            Fe = Logics.getOnlyExplicitFacts(F),
            Fi = Logics.getOnlyImplicitFacts(F);

        if(FeDel && FeDel.length) {
            // Overdeletion
            do {
                FiDel = Utils.uniques(FiDel, FiDelNew);
                Rdel = Logics.restrictRuleSet(R, Utils.uniques(FeDel, FiDel));
                FiDelNew = Solver.evaluateRuleSet(Rdel, Utils.uniques(Utils.uniques(Fi, Fe), FeDel));
            } while (Utils.uniques(FiDel, FiDelNew).length > FiDel.length);
            Fe = Logics.minus(Fe, FeDel);
            Fi = Logics.minus(Fi, FiDel);

            // Rederivation
            do {
                FiAdd = Utils.uniques(FiAdd, FiAddNew);
                Rred = Logics.restrictRuleSet(R, FiDel);
                FiAddNew = Solver.evaluateRuleSet(Rred, Utils.uniques(Utils.uniques(Fe, Fi), FiDel));
            } while(Utils.uniques(FiAdd, FiAddNew).length > FiAdd.length);

        }

        // Insertion
        if(FeAdd && FeAdd.length) {
            do {
                FiAdd = Utils.uniques(FiAdd, FiAddNew);
                superSet = Utils.uniques(Utils.uniques(Utils.uniques(Fe, Fi), FeAdd), FiAdd);
                Rins = Logics.restrictRuleSet(R, superSet);
                FiAddNew = Solver.evaluateRuleSet(Rins, superSet);
            } while (Utils.uniques(FiAdd, FiAddNew).length > FiAdd.length);
        }

        additions = Utils.uniques(FeAdd, FiAdd);
        deletions = Utils.uniques(FeDel, FiDel);

        F = Utils.uniques(F, additions);
        F = Logics.minus(F, deletions);

        return {
            additions: additions,
            deletions: deletions,
            updatedF: F
        };
    },

    incrementalBf: function (FeAdd, FeDel, F, R) {

        R = Logics.decomposeRuleHeadsIntoSeveralRules(R);

        var backwardForwardDelete = function(E, I, FeDel, R) {
            var C = new Utils.IterableStructure(), D = new Utils.IterableStructure(), P = new Utils.IterableStructure(),
                Y = [], O = new Utils.IterableStructure(), S = [],
                V = new Utils.IterableStructure(), IWithoutO, DWithoutP, IWithoutS,
                fact, tuples, evalRes;

            var checkProvability = function(fact) {
                var tuples, smallestSubstitutions, substitutedRuleFacts;

                if (!C.add(fact)) {
                    return;
                }

                saturate();

                if (P.contains(fact)) {
                    return;
                }

                tuples = Solver.matchHead(R, fact);

                for (var i = 0; i < tuples.length; i++) {
                    smallestSubstitutions = Solver.eval(IWithoutS, tuples[i].annotatedQuery, [], tuples[i].mapping, tuples[i].rule.constants);
                    for (var j = 0; j < tuples[i].rule.causes.length; j++) {
                        substitutedRuleFacts = Solver.substitute(tuples[i].rule.causes[j], smallestSubstitutions);
                        for (var k = 0; k < substitutedRuleFacts.length; k++) {
                            checkProvability(substitutedRuleFacts[k]);
                        }
                    }
                    if (fact.appearsIn(P)) {
                        return;
                    }
                }
            };

            var saturate = function() {
                var tuplesMatchBody, fact, evalRes, H;

                while (fact = C.next()) {
                    if (fact.appearsIn(E) || fact.appearsIn(Y)) {
                        P.add(fact);
                    }
                }

                while (fact = P.next()) {
                    if (V.add(fact)) {
                        tuplesMatchBody = Solver.matchBody(R, fact);
                        for (var i = 0; i < tuplesMatchBody.length; i++) {
                            evalRes = Solver.eval(V.toArray(), tuplesMatchBody[i].annotatedQuery, [fact], tuplesMatchBody[i].mapping);
                            H = Solver.substitute(tuplesMatchBody[i].rule.consequences[0], evalRes);
                            for (var j = 0; j < H.length; j++) {
                                if(C.contains(H[j])) {
                                    P.add(H);
                                } else {
                                    Y.add(H);
                                }
                            }
                        }
                    }
                }

                return;
            };

            E = Logics.minus(E, FeDel);
            D.add(FeDel);

            while (fact = D.next()) {
                IWithoutS = Logics.minus(I, S);
                checkProvability(fact);
                S = Logics.minus(C.toArray(), P.toArray());

                if (!P.contains(fact)) {
                    IWithoutO = Logics.minus(I, O.toArray());
                    tuples = Solver.matchBody(R, fact);
                    for (var i = 0; i < tuples.length; i++) {
                        evalRes = Solver.eval(IWithoutO, tuples[i].annotatedQuery, [fact], tuples[i].mapping, tuples[i].rule.constants);
                        D.add(Solver.substitute(tuples[i].rule.consequences[0], evalRes));
                    }
                    O.add(fact);
                }
            }

            DWithoutP = Logics.minus(D.toArray(), P.toArray());
            I = Logics.minus(I, DWithoutP[i]);

            return I;
        };

        var Rins = [],
            FiDel = [], FiAdd = [],
            FiAddNew = [], superSet = [],

            additions, deletions,

            Fe = Logics.getOnlyExplicitFacts(F),
            Fi = Logics.getOnlyImplicitFacts(F);

        if(FeDel && FeDel.length) {
            FiDel = backwardForwardDelete(Fe, Fi, FeDel, R);
        }

        // Insertion
        if(FeAdd && FeAdd.length) {
            do {
                FiAdd = Utils.uniques(FiAdd, FiAddNew);
                superSet = Utils.uniques(Utils.uniques(Utils.uniques(Fe, Fi), FeAdd), FiAdd);
                Rins = Logics.restrictRuleSet(R, superSet);
                FiAddNew = Solver.evaluateRuleSet(Rins, superSet);
            } while (Utils.uniques(FiAdd, FiAddNew).length > FiAdd.length);
        }

        additions = Utils.uniques(FeAdd, FiAdd);
        deletions = Utils.uniques(FeDel, FiDel);

        F = Utils.uniques(F, additions);
        F = Logics.minus(F, deletions);

        return {
            additions: additions,
            deletions: deletions,
            updatedF: F
        };
    },

    /**
     * Returns valid facts using explicit facts' validity tags.
     * @param F
     * @param refs
     * @returns {Array}
     */
    tagFilter: function(F, refs) {
        var validSet = [], kb_fe = Logics.getOnlyExplicitFacts(refs), f;
        for (var i = 0; i < F.length; i++) {
            f = F[i];
            if(f.explicit && f.valid) {
                validSet.push(f);
            } else if(f.isValid(kb_fe)) {
                validSet.push(f)
            }
        }
        return validSet;
    },

    /**
     * Tags newly inferred facts, and (un)validates updated ones.
     * Explicit facts are 'validity'-tagged, while
     * implicit ones are 'causedBy'-tagged.
     * @param FeAdd
     * @param FeDel
     * @param F
     * @param R
     * @returns {{additions: *, deletions: Array}}
     */
    tagging: function(FeAdd, FeDel, F, R) {
        var FiAdd = [],
            Rins = [],
            Fe = Logics.getOnlyExplicitFacts(F),
            Fi = Logics.getOnlyImplicitFacts(F),
            superSet;

        if(FeDel.length > 0) {
            FeDel = Logics.invalidate(FeDel);
        }

        if(FeAdd.length > 0) {
            do {
                Fi = Logics.combine(Fi, FiAdd);
                superSet = Utils.uniques(Utils.uniques(Fe, FeAdd), Fi);
                Rins = Logics.restrictRuleSet(R, superSet);
                FiAdd = Solver.evaluateRuleSet(Rins, superSet, true);
            } while (!Utils.containsSubset(Fi, FiAdd));
        }

        return {
            additions: Logics.combineAll([FeDel, FeAdd, Fi]),
            deletions: []
        };
    }
};

module.exports = {
    naive: ReasoningEngine.naive,
    incrementalBf: ReasoningEngine.incrementalBf,
    incremental: ReasoningEngine.incremental,
    tagging: ReasoningEngine.tagging,
    tagFilter: ReasoningEngine.tagFilter
};
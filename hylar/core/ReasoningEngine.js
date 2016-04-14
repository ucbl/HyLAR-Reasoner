/**
 * Created by Spadon on 11/09/2015.
 */

var Logics = require('./Logics/Logics'),
    Solver = require('./Logics/Solver');

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
            Fe = Logics.uniques(Fe, FeAdd);
        }

        // Recalculation
        do {
            FiAdd = Logics.uniques(FiAdd, FiAddNew);
            FiAddNew = Solver.evaluateRuleSet(R, Logics.uniques(Fe, FiAdd));
        } while (!Logics.containsFacts(FiAdd, FiAddNew));

        additions = Logics.uniques(FeAdd, FiAdd);
        deletions = Logics.minus(F, Logics.uniques(Fe, FiAdd));

        F = Logics.uniques(Fe, FiAdd);

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
                FiDel = Logics.uniques(FiDel, FiDelNew);
                Rdel = Logics.restrictRuleSet(R, Logics.uniques(FeDel, FiDel));
                FiDelNew = Solver.evaluateRuleSet(Rdel, Logics.uniques(Logics.uniques(Fi, Fe), FeDel));
            } while (Logics.uniques(FiDel, FiDelNew).length > FiDel.length);
            Fe = Logics.minus(Fe, FeDel);
            Fi = Logics.minus(Fi, FiDel);

            // Rederivation
            do {
                FiAdd = Logics.uniques(FiAdd, FiAddNew);
                Rred = Logics.restrictRuleSet(R, FiDel);
                FiAddNew = Solver.evaluateRuleSet(Rred, Logics.uniques(Logics.uniques(Fe, Fi), FiDel));
            } while(Logics.uniques(FiAdd, FiAddNew).length > FiAdd.length);

        }

        // Insertion
        if(FeAdd && FeAdd.length) {
            do {
                FiAdd = Logics.uniques(FiAdd, FiAddNew);
                superSet = Logics.uniques(Logics.uniques(Logics.uniques(Fe, Fi), FeAdd), FiAdd);
                Rins = Logics.restrictRuleSet(R, superSet);
                FiAddNew = Solver.evaluateRuleSet(Rins, superSet);
            } while (Logics.uniques(FiAdd, FiAddNew).length > FiAdd.length);
        }

        additions = Logics.uniques(FeAdd, FiAdd);
        deletions = Logics.uniques(FeDel, FiDel);

        F = Logics.uniques(F, additions);
        F = Logics.minus(F, deletions);

        return {
            additions: additions,
            deletions: deletions,
            updatedF: F
        };
    },

    incrementalBf: function (FeAdd, FeDel, F, R) {
        var backwardForwardDelete = function(Fe, Fi, FeDel, R) {
            var C = [], D = [], P = [],
                Y = [], O = [], S = [],
                V = [], matchedRules,
                CWithoutP, FiWithoutO, DWithoutP;

            for (var i = 0; i < FeDel.length; i++) {
                Fe = Logics.minus(Fe, [FeDel[i]]);
                D = Logics.uniques(D, [FeDel[i]]);
            }

            for (var i = 0; i < D.length; i++) {
                Solver.checkProvability(D[i], R, C, Fe, Y, P, V, Logics.minus(Fi, S));
                CWithoutP = Logics.minus(C, P);

                for (var j = 0; j < CWithoutP.length; j++) {
                    Logics.addToFactSet(S, CWithoutP[j]);
                }

                if (Logics.minus(P, [D[i]]).length == P.length) {
                    matchedRules = Logics.restrictRuleSet(R, D[i]);
                    FiWithoutO = Logics.minus(Fi, O);

                    D = Logics.uniques(D, Solver.evaluateRuleSet(matchedRules, FiWithoutO));
                    Logics.uniques(O, [D[i]]);
                }
            }

            DWithoutP = Logics.minus(D, P);

            for (var i = 0; i < DWithoutP.length; i++) {
                Fi = Logics.minus(Fi, [DWithoutP[i]]);
            }
        };

        var Rins = [],
            FiDel = [], FiAdd = [],
            FiAddNew = [], superSet = [],

            additions, deletions,

            Fe = Logics.getOnlyExplicitFacts(F),
            Fi = Logics.getOnlyImplicitFacts(F),
            FiAfterBf = Fi;

        if(FeDel && FeDel.length) {
            backwardForwardDelete(Fe, FiAfterBf, FeDel, R);
            FiAdd = Logics.minus(FiAfterBf, Fi);
        }

        // Insertion
        if(FeAdd && FeAdd.length) {
            do {
                FiAdd = Logics.uniques(FiAdd, FiAddNew);
                superSet = Logics.uniques(Logics.uniques(Logics.uniques(Fe, FiAdd), FeAdd), FiAdd);
                Rins = Logics.restrictRuleSet(R, superSet);
                FiAddNew = Solver.evaluateRuleSet(Rins, superSet);
            } while (Logics.uniques(FiAdd, FiAddNew).length > FiAdd.length);
        }

        additions = Logics.uniques(FeAdd, FiAdd);
        deletions = Logics.uniques(FeDel, FiDel);

        F = Logics.uniques(F, additions);
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
        var FiAddNew = [],
            FiAdd = [],
            Rins = [],
            Fe = Logics.getOnlyExplicitFacts(F),
            Fi = Logics.getOnlyImplicitFacts(F),
            superSet, validatedFacts = [];

        if(FeDel.length > 0) {
            FeDel = Logics.invalidate(Fe, FeDel);
        }

        if(Logics.validateExistingFacts(F, FeAdd).unknownFacts.length > 0) {
            do {
                FiAdd = Logics.mergeFactSets(FiAdd, FiAddNew);
                superSet = Logics.mergeFactSetsIn([Fe, Fi, FeAdd, FiAdd]);
                Rins = Logics.restrictRuleSet(R, superSet);
                FiAddNew = Solver.evaluateRuleSet(Rins, superSet);
            } while (!Logics.containsFacts(FiAdd, FiAddNew));
        }

        return {
            additions: Logics.mergeFactSetsIn([FeDel, FeAdd, validatedFacts, FiAdd]),
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
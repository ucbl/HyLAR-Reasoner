/**
 * Created by Spadon on 11/09/2015.
 */

var Logics = require('./Logics/Logics'),
    Solver = require('./Logics/Solver');


ReasoningEngine = {
    /**
     * A naive reasoner that recalculates the entire knowledge base.
     * Concat is preferred over merge for evaluation purposes.
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
            } while (!Logics.containsFacts(FiDel, FiDelNew));
            Fe = Logics.minus(Fe, FeDel);
            Fi = Logics.minus(Fi, FiDel);

            // Rederivation
            do {
                FiAdd = Logics.uniques(FiAdd, FiAddNew);
                Rred = Logics.restrictRuleSet(R, FiDel);
                FiAddNew = Solver.evaluateRuleSet(Rred, Logics.uniques(Logics.uniques(Fe, Fi), FiAdd));
            } while(!Logics.containsFacts(FiAdd, FiAddNew));

        }

        // Insertion
        if(FeAdd && FeAdd.length) {
            do {
                FiAdd = Logics.uniques(FiAdd, FiAddNew);
                superSet = Logics.uniques(Logics.uniques(Logics.uniques(Fe, Fi), FeAdd), FiAdd);
                Rins = Logics.restrictRuleSet(R, superSet);
                FiAddNew = Solver.evaluateRuleSet(Rins, superSet);
            } while (!Logics.containsFacts(FiAdd, FiAddNew));
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

    tagging: function(FeAdd, FeDel, F, R) {
        var FiAddNew = [],
            FiAdd = [],
            Rins = [],
            Fe = Logics.getOnlyExplicitFacts(F),
            Fi = Logics.getOnlyImplicitFacts(F),
            superSet, conjunctions;

        if(FeDel.length > 0) {
            FeDel = Logics.invalidate(Fe, FeDel);
        }

        if(FeAdd.length > 0) {
            if(!Logics.containsFacts(Fe, FeAdd)) {
                do {
                    FiAdd = Logics.mergeFactSets(FiAdd, FiAddNew);
                    superSet = Logics.mergeFactSetsIn([Fe, Fi, FeAdd, FiAdd]);
                    Rins = Logics.restrictRuleSet(R, superSet);
                    FiAddNew = Solver.evaluateRuleSet(Rins, superSet);

                } while (!Logics.containsFacts(FiAdd, FiAddNew));
            }
        }

        return {
            additions: Logics.mergeFactSetsIn([FeDel, FeAdd, FiAdd])
        };
    }
};

module.exports = {
    naive: ReasoningEngine.naive,
    incremental: ReasoningEngine.incremental,
    tagging: ReasoningEngine.tagging,
    tagFilter: ReasoningEngine.tagFilter
};
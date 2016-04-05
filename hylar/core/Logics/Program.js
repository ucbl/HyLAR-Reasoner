/**
 * Created by aifb on 04.04.16.
 */

Program = function (rules) {
    this.rules = rules;
};

/**
 * @todo
 * A (datalog) program P contains a set of rules
 */
Program.prototype = {

    /**
     * Returns P', the rules in P
     * with no idb predicate in the body.
     */
    getIdbProgram: function() {

    },

    /**
     * Returns all mutual recursions between idb rules
     * (i.e. the equivalent classes of idb(P) under
     * mutual recursion)
     */
    getMutualRecursions: function() {

    },

    /**
     * Returns the predicate dependency graph.
     */
    getPredicateDependencies: function() {

    }

};
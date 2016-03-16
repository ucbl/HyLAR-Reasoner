/**
 * Created by MT on 11/09/2015.
 * Logics module
 */

/**
 * All necessary stuff around the Logics module
 * @type {{substractFactSets: Function, mergeFactSets: Function}}
 */
module.exports = {
    /**
     * Returns fs1 without the facts occuring in fs2.
     * If a fact in fs2 also appears on any graph not concerned by fs1,
     * it only removes the graph concerned by fs1
     * without removing the fact from fs2.
     * @param fs1
     * @param fs2
     */
    substractFactSets: function(fs1, fs2) {
        var fact, result = [], t = [];
        for (var i = 0; i < fs1.length; i++) {
            fact = fs1[i];
            if(!fact.appearsIn(fs2)) {
                result.push(fact);
            }
        }
        return result;
    },

    substractGraphSets: function(f1, f2) {
        var graphs = [];
        for(var key in f1.graphs) {
            var gf1 = f1.graphs[key];
            if(JSON.stringify(f2).indexOf(gf1) == -1) {
                graphs.push(gf1);
            }
        }
        f1.graphs = graphs;
        return f1;
    },

    restrictToGraphs: function(fs, gs) {
        var fr = [];
        if(!gs || gs.length == 0) return fs;
        for (var key in fs) {
            if(this.shareSomeGraph(fs[key].graphs, gs)) {
                fr.push(fs[key])
            }
        }
        return fr;
    },

    shareSomeGraph: function(gs1, gs2) {
        if(gs1.length == 0 && gs2.length == 0) return true;
        for (var key in gs1) {
            if(JSON.stringify(gs2).indexOf(JSON.stringify(gs1[key])) != -1) return true;
        }
        return false;
    },

    /**
     * True-like merge, which also merges
     * identical facts obtainedFrom properties.
     * @param fs1
     * @param fs2
     */
    mergeFactSets: function(fs1, fs2) {
        var fact,
            maxMin = this.maxMin(fs1, fs2),
            fsMax = maxMin.max,
            fsMin = maxMin.min;

        for (var i = 0; i < fsMin.length; i++) {
            fact = fsMin[i];
            fsMax = this.findAndMerge(fsMax, fact);
        }
        return fsMax;
    },

    mergeFactSetsIn: function(_set) {
        var that = this, fs,
            finalSet = [];
        for (var i = 0; i < _set.length; i++) {
            fs = _set[i];
            finalSet = that.mergeFactSets(fs, finalSet);
        }
        return finalSet;
    },

    getOnlyImplicitFacts: function(fs) {
        var fR = [];
        for (var key in fs) {
            var fact = fs[key];
            if(!fact.explicit) {
                fR.push(fact);
            }
        }
        return fR;
    },

    getOnlyExplicitFacts: function(fs) {
        var fR = [];
        for (var key in fs) {
            var fact = fs[key];
            if(fact.explicit) {
                fR.push(fact);
            }
        }
        return fR;
    },

    restrictFactSet: function(rule, fs) {
        var restriction = [];

        for (var k = 0; k < fs.length; k++) {
            var fact = fs[k];

            for (var i = 0; i < rule.causes.length; i++) {
                var cause = rule.causes[i];

                if (this.causeMatchesFact(cause, fact)) {
                    restriction.push(fact)
                    break;
                }
            }
        }

        return restriction;
    },

    restrictRuleSet: function(rs, fs) {
        var restriction = [];

        for (var i = 0; i < rs.length; i++) {
            var rule = rs[i], matches = false;

            for (var j = 0; j < rule.causes.length; j++) {
                var cause = rule.causes[j];

                for (var k = 0; k < fs.length; k++) {
                    var fact = fs[k];

                    if (this.causeMatchesFact(cause, fact)) {
                        matches = true;
                        break;
                    }
                }

                if (matches) {
                    restriction.push(rule);
                    break;
                }
            }
        }

        return restriction;
    },

    causeMatchesFact: function(cause, fact) {
        return this.causeMemberMatchesFactMember(cause.subject, fact.subject)
            && this.causeMemberMatchesFactMember(cause.predicate, fact.predicate)
            && this.causeMemberMatchesFactMember(cause.object, fact.object);
    },

    causeMemberMatchesFactMember: function(causeMember, factMember) {
        if (this.isVariable(causeMember)) {
            return true;
        } else if(causeMember == factMember) {
            return true;
        } else {
            return false;
        }
    },

    mergeGraphs: function(fs) {
        var graphs = [];
        for(var key in fs) {
            var f = fs[key];
            graphs = this.uniques(graphs, f.graphs);
        }
        return graphs;
    },

    graphsFrom: function(gs) {
        var graphs = [];
        for (var key in gs) {
            var currGraphs = gs[key].graphs;
            graphs = this.uniques(graphs, currGraphs);
        }
        return graphs;
    },

    restrictToGraphsFrom: function(fsRet, fsSrc) {
        return this.restrictToGraphs(fsRet, this.graphsFrom(fsSrc));
    },

    /**
     * Merges two facts' obtainedWith properties
     * if they are equivalent (otherwise, returns false).
     */
    mergeFacts: function(f1, f2) {
        if(!(f1.equivalentTo(f2))) {
            return false;
        } else {
            f1.causedBy = this.uniques(f1.causedBy, f2.causedBy);
            f1.graphs = this.uniques(f1.graphs, f2.graphs);
            return f1;
        }
    },

    /**
     * Finds the fact in the set
     * and merges their causes / graphs appearance.
     */
    findAndMerge: function(fs, fact) {
        var merged;
        for(var key in fs) {
            merged = this.mergeFacts(fs[key], fact);
            if (merged) {
                fs[key] = merged;
                return fs;
            }
        }

        fs.push(fact);
        return fs;
    },

    /**
     * Checks if a set of facts is a subset of another set of facts.
     * @param fs1 the superset
     * @param fs2 the potential subset
     */
    containsFacts: function(fs1, fs2) {
        if(!fs2 || (fs2.length > fs1.length)) return false;
        for (var key in fs2) {
            var fact = fs2[key];
            if(!(fact.appearsIn(fs1))) {
                return false;
            }
        }
        return true;
    },

    /**
     * Returns the max and min from two sets of facts
     * (cloning)
     * @param fs1
     * @param fs2
     * @returns {{max: *, min: *}}
     */
    maxMin: function(fs1, fs2) {
        if (fs1.length > fs2.length) return {
            max: fs1,
            min: fs2
        };
        return {
            max: fs2,
            min: fs1
        };
    },

    /**
     * Invalidates a fact.
     * @param fs1
     * @param fs2
     * @returns {Array}
     */
    invalidate: function(fs1, fs2) {
        var invalidated = [], f2;
        for (var i = 0; i < fs2.length; i++) {
            f2 = fs2[i];
            if(f2.appearsIn(fs1)) {
                f2.valid = false;
                invalidated.push(f2);
            }
        }
        return invalidated;
    },

    /**
     * @deprecated Computes each conjunction given a set of facts, order-independently
     * @param facts
     * @param max
     * @param imin
     * @returns {*}
     */
    computeConjunctions: function(facts, max, imin) {
        var conjs, others, combine;
        if(imin === undefined) {
            imin = 0;
        }
        if ((max == 0) || (imin == facts.length)) {
            return [];
        }
        conjs = [[facts[imin]]];
        others = this.computeConjunctions(facts, max, imin+1);

        for (var j = 0; j < others.length; j++) {
            if (others[j].length < max) {
                combine = others[j].slice();
                combine.push(facts[imin]);
                conjs.push(combine);
            }
        }
        return conjs.concat(others);
    },

    /**
     * Returns a set of elements
     * with distinct string representation.
     * @warning does not merge facts
     * @param _set1
     * @param _set2
     * @returns {Array}
     */
    uniques: function(_set1, _set2) {
        var hash = {}, uniq = [],
            fullSet = _set1.concat(_set2);

        for (var i = 0; i < fullSet.length; i++) {
            hash[fullSet[i].toString()] = fullSet[i];
        }

        for (var key in hash) {
            uniq.push(hash[key]);
        }
        return uniq;
    },

    minus: function(_set1, _set2) {
        var flagEquals,
            newSet = [];
        for (var i = 0; i < _set1.length; i++) {
            flagEquals = false;
            for(var j = 0; j < _set2.length; j++) {
                if (_set1[i].toString() == _set2[j].toString()) {
                    flagEquals = true;
                    break;
                }
            }
            if (!flagEquals) {
                newSet.push(_set1[i]);
            }
        }

        return newSet;
    },

    isVariable: function(str) {
        try {
            return (str.indexOf('?') === 0);
        } catch(e) {
            return false;
        }
    },
};
/**
 * Created by MT on 11/09/2015.
 * Logics module
 */

var Rule = require('./Rule');
var Utils = require('../Utils');

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
     * @deprecated
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

    /**
     * @deprecated
     * @param f1
     * @param f2
     * @returns {*}
     */
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

    /**
     * @deprecated
     * @param fs
     * @param gs
     * @returns {*}
     */
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

    /**
     * @deprecated
     * @param gs1
     * @param gs2
     * @returns {boolean}
     */
    shareSomeGraph: function(gs1, gs2) {
        if(gs1.length == 0 && gs2.length == 0) return true;
        for (var key in gs1) {
            if(JSON.stringify(gs2).indexOf(JSON.stringify(gs1[key])) != -1) return true;
        }
        return false;
    },

    /**
     * True-like merge of two facts sets, which also merges
     * identical facts causedBy properties.
     * @param fs1
     * @param fs2
     */
    combine: function(fs1, fs2) {
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

    /**
     * True-like merge of facts sets in the provided array,
     * which also merges identical facts obtainedFrom properties.
     * @param _set the set of facts sets.
     */
    combineAll: function(_set) {
        var that = this, fs,
            finalSet = [];
        for (var i = 0; i < _set.length; i++) {
            fs = _set[i];
            finalSet = that.combine(fs, finalSet);
        }
        return finalSet;
    },

    /**
     * Returns implicit facts from the set.
     * @param fs
     * @returns {Array}
     */
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

    /**
     * Returns explicit facts from the set.
     * @param fs
     * @returns {Array}
     */
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

    /**
     * Returns a restricted rule set,
     * in which at least one fact from the fact set
     * matches all rules.
     * @param rs
     * @param fs
     * @returns {Array}
     */
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

    /**
     * Checks if a cause matches a fact, i.e. is the cause's pattern
     * can be satisfied by the fact.
     * @param cause
     * @param fact
     * @returns {*}
     */
    causeMatchesFact: function(cause, fact) {
        return this.causeMemberMatchesFactMember(cause.subject, fact.subject)
            && this.causeMemberMatchesFactMember(cause.predicate, fact.predicate)
            && this.causeMemberMatchesFactMember(cause.object, fact.object);
    },

    /**
     * Return true if the cause and fact members (subjects, objects or predicates)
     * are equal (if URI) or if both are variables. Returns false otherwise.
     * @param causeMember
     * @param factMember
     * @returns {boolean}
     */
    causeMemberMatchesFactMember: function(causeMember, factMember) {
        if (this.isVariable(causeMember)) {
            return true;
        } else if(causeMember == factMember) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * @deprecated
     * @param fs
     * @returns {Array}
     */
    mergeGraphs: function(fs) {
        var graphs = [];
        for(var key in fs) {
            var f = fs[key];
            graphs = Utils.uniques(graphs, f.graphs);
        }
        return graphs;
    },

    /**
     * @deprecated
     * @param gs
     * @returns {Array}
     */
    graphsFrom: function(gs) {
        var graphs = [];
        for (var key in gs) {
            var currGraphs = gs[key].graphs;
            graphs = Utils.uniques(graphs, currGraphs);
        }
        return graphs;
    },

    /**
     * @deprecated
     * @param fsRet
     * @param fsSrc
     * @returns {*}
     */
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
            f1.causedBy = Utils.uniques(f1.causedBy, f2.causedBy);
            f1.graphs = Utils.uniques(f1.graphs, f2.graphs);
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
     * Invalidates a fact set.
     * @param fs1
     * @param fs2
     * @returns {Array}
     */
    invalidate: function(fs1) {
        for (var i = 0; i < fs1.length; i++) {
            fs1[i].valid = false;
        }
        return fs1;
    },

    /**
     * Validates facts from setToValidate which
     * appear in the originalSet.
     * @deprecated Not used anymore
     * @param originalSet
     * @param setToValidate
     * @returns {{validatedFacts: Array, unknownFacts: Array}}
     */
    validateExistingFacts: function(originalSet, setToValidate) {
        var containsUnknownFacts = false;
        for (var i = 0; i < setToValidate.length; i++) {
            var factToValidate = setToValidate[i];
            if(factToValidate.appearsIn(originalSet)) {
                factToValidate.valid = true;
            } else {
                containsUnknownFacts = true;
            }
        }

        return containsUnknownFacts;
    },

    /**
     * Substracts each set.
     * Not to be used in tag-based reasoning.
     * @param _set1
     * @param _set2
     * @returns {Array}
     */
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

    /**
     * Checks if a string is a variable,
     * @param str
     * @returns {boolean}
     */
    isVariable: function(str) {
        try {
            return (str.indexOf('?') === 0);
        } catch(e) {
            return false;
        }
    },

    addToFactSet: function(factSet, fact) {
        var originalFactSetLength = factSet.length;
        if (!fact.appearsIn(factSet)) {
            factSet.unshift(fact);
            return true;
        } else {
            return false;
        }
    },

    decomposeRuleHeadsIntoSeveralRules: function(ruleSet) {
        var newRuleSet = [];
        for (var i = 0; i < ruleSet.length; i++) {
            for (var j = 0; j < ruleSet[i].consequences.length; j++) {
                newRuleSet.push(new Rule(ruleSet[i].causes, [ruleSet[i].consequences[j]]));
            }
        }
        return newRuleSet;
    },

    factIsGround: function(fact) {
        return !this.isVariable(fact.subject) && !this.isVariable(fact.predicate) && !this.isVariable(fact.object)
    },

    /**
     * Returns the fact if it appears in a set of facts.
     * Returns false otherwise.
     * @param factSet
     */
    refAppearsIn: function(str, factSet) {
        for (var key in factSet) {
            if(str == factSet[key].toString()) {
                return factSet[key];
            }
        }
        return false;
    }

};
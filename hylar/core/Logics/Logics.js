/**
 * Created by MT on 11/09/2015.
 * Logics module
 */

var Rule = require('./Rule');
var Fact = require('./Fact');
var Utils = require('../Utils');
var Errors = require('../Errors');
var RegularExpressions = require('../RegularExpressions');
var Prefixes = require('../Prefixes')

var md5 = require('md5');

/**
 * All necessary stuff around the Logics module
 * @type {{substractFactSets: Function, mergeFactSets: Function}}
 */

Logics = {
    /**
     * True-like merge of two facts sets, which also merges
     * identical facts causedBy properties.
     * @param fs1
     * @param fs2
     */
    combine: function(fs, subset) {
        for (var i = 0; i < fs.length; i++) {
            for (var j = 0; j < subset.length; j++) {
                if ((subset[j] !== undefined) && (fs[i].equivalentTo(subset[j]))) {
                    fs[i].causedBy = this.uniquesCausedBy(fs[i].causedBy, subset[j].causedBy);
                    fs[i].consequences = fs[i].consequences.concat(subset[j].consequences);
                    subset[j].doPropagate(fs[i]);                                                            
                    delete subset[j];
                }
            }
        }
        for (i = 0; i < subset.length; i++) {
            if (subset[i] !== undefined) fs.push(subset[i]);
        }
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
        return this.causeMemberMatchesFactMember(cause.predicate, fact.predicate) 
            && this.causeMemberMatchesFactMember(cause.subject, fact.subject)
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
        if(causeMember == factMember) {
            return true;
        } else if (causeMember.indexOf('?') === 0) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * Return true if the two atoms are either both variables, or
     * identical URIs.
     * @returns {boolean}
     */
    similarAtoms: function(atom1, atom2) {
        if (this.isVariable(atom1) && this.isVariable(atom2) ) {
            return true;
        } else if(atom1 == atom2) {
            return true;
        } else {
            return false;
        }
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
                if (_set1[i].asString == _set2[j].asString) {
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

    updateValidTags: function(kb, additions, deletions) {
        var newAdditions = [],
            resolvedAdditions = [],
            kbMap = kb.map(function(x) { return x.toRaw(); }), index;
        for (var i = 0; i < additions.length; i++) {
            index = kbMap.indexOf(additions[i].toRaw());
            if (index !== -1) {
                if (kb[index].explicit) {
                    kb[index].valid = true;
                } else {
                    this.addAlternativeDerivationAsCausedByFromExplicit(kb, kb[index], additions[i]);
                    resolvedAdditions.push(additions[i]);
                }
            } else {
                newAdditions.push(additions[i]);
            }
        }
        
        for (i= 0; i < deletions.length; i++) {
            index = kbMap.indexOf(deletions[i].toRaw());
            if (index !== -1 && kb[index].explicit) {
                kb[index].valid = false;                
            }
        }

        return {
            new: newAdditions,
            resolved: resolvedAdditions
        };
    },

    addAlternativeDerivationAsCausedByFromExplicit: function(kb, kbFact, altFact) {
        var derivations = kbFact.consequences;

        for (var i = 0; i < derivations.length; i++) {
            derivations[i].causedBy = Utils.insertUnique(derivations[i].causedBy, [altFact]);
            for (var j = 0; j < derivations[i].consequences.length; j++) {
                this.addAlternativeDerivationAsCausedByFromExplicit(kb, derivations[i].consequences[j], altFact);
            }
        }
    },

    buildCauses: function(conjunction) {
        var explicitFacts = this.getOnlyExplicitFacts(conjunction),
            implicitFacts = this.getOnlyImplicitFacts(conjunction),
            combinedImplicitCauses,
            builtCauses = [];

        if (implicitFacts.length > 0) {
            combinedImplicitCauses = this.combineImplicitCauses(implicitFacts);
            if (explicitFacts.length > 0) {
                for (var i = 0; i < combinedImplicitCauses.length; i++) {
                    for (var j = 0; j < explicitFacts.length; j++) {
                        builtCauses.push(Utils.insertUnique(combinedImplicitCauses[i], explicitFacts[j]));
                    }
                }
                return builtCauses;
            } else {
                return combinedImplicitCauses;
            }
        } else {
            return [conjunction];
        }
    },

    addConsequences: function(facts, consequences) {
        for (var i = 0; i < facts.length; i++) {
            if (!facts[i].explicit) {
                facts[i].consequences = facts[i].consequences.concat(consequences);
                for (var j = 0; j < consequences.length; j++) {
                    consequences[j].__propagate__ = facts[i];
                }
            }
        }
    },

    combineImplicitCauses: function(implicitFacts) {
        var combination = implicitFacts[0].causedBy;
        for (var i = 1; i < implicitFacts.length; i++) {
            combination = this.disjunctCauses(combination, implicitFacts[i].causedBy)
        }
        return combination;
    },

    disjunctCauses: function(prev, next) {
        var conjunction, disjunction = [];

        if ((prev == []) || (next == [])) {
            throw Errors.OrphanImplicitFact();
        }

        for (var i = 0; i < prev.length; i++) {
            conjunction = prev[i];
            for (var j = 0; j < next.length; j++) {
                disjunction.push(Utils.uniques(conjunction, next[j]));
            }
        }
        return disjunction;
    },

    unifyFactSet: function(fs) {
        var unifiedSet = [],
            foundFactIndex;
        for (var i = 0; i < fs.length; i++) {
            if (fs[i] !== undefined) {
                if (foundFactIndex = fs[i].appearsIn(unifiedSet)) {
                    unifiedSet[foundFactIndex].causedBy = this.uniquesCausedBy(fs[i].causedBy, unifiedSet[foundFactIndex].causedBy);
                    unifiedSet[foundFactIndex].consequences = Utils.uniques(fs[i].consequences, unifiedSet[foundFactIndex].consequences);                    
                    fs[i].doPropagate(unifiedSet[foundFactIndex]);                   
                } else {
                    unifiedSet.push(fs[i]);
                }
            }
        }
        return unifiedSet;
    },

    unify: function(subSet, updatingSet) {
        var initialLength = updatingSet.length;

        subSet = this.unifyFactSet(subSet);
        this.combine(updatingSet, subSet);

        if (initialLength < updatingSet.length) {
            return true;
        } else {
            return false;
        }
    },

    uniquesCausedBy: function(cb1, cb2) {
        var min, max, newCb = [], found;

        if (cb1.length >= cb2.length) {
            min = cb2;
            max = cb1;
        } else {
            min = cb1;
            max = cb2;
        }

        for (var i = 0; i < max.length; i++) {
            found = false;
            for (var j = 0; j < min.length; j++) {
                if (this.containsFacts(min[j], max[i])) {
                    found = true;
                    if (min.length != max.length) {
                        min[j] = max[i];
                    }
                    break;
                }
            }

            if (!found) {
                newCb.push(max[i]);
            }
        }

        newCb = newCb.concat(min.slice());

        return newCb;
    },

    parseRules: function(strRuleList, entailment = Rule.types.CUSTOM) {
        var parsedRuleList = [];
        for (var i = 0; i < strRuleList.length; i++) {
			let match = strRuleList[i].match('(.+)=(.+)')
			if (match) {
				parsedRuleList.push(this.parseRule(match[2], match[1], entailment))
			} else {
				parsedRuleList.push(this.parseRule(strRuleList[i], null, entailment))
			}
        }
        return parsedRuleList;
    },

    parseRule: function(strRule, name = `rule-${md5(strRule)}`, entailment) {
        let bodyTriples = strRule.split('->')[1].match(RegularExpressions.TRIPLE)
        let headTriples = strRule.split('->')[0].match(RegularExpressions.TRIPLE)

        let causes = this._createFactSetFromTriples(headTriples)
        let consequences = this._createFactSetFromTriples(bodyTriples)

        return new Rule(causes, consequences, name, entailment)
    },

    _createFactSetFromTriples(triples) {
        let set = []
        if (triples[0] == 'false') {
            set.push(new Fact('FALSE'))
        } else {
            for (var i = 0; i < triples.length; i++) {
                let atoms = []

                for (let atom of triples[i].match(RegularExpressions.ATOM).splice(1)) {
                    if (atom.match(RegularExpressions.PREFIXED_URI)) {
                        atom = Prefixes.replacePrefixWithUri(atom, atom.match(RegularExpressions.PREFIXED_URI)[1])
                    }
                    atoms.push(atom)
                }

                set.push(new Fact(atoms[1], atoms[0], atoms[2]));
            }
        }
        return set
    },

    isBNode: function(elem) {
        return ( (elem !== undefined) && (elem.indexOf('__bnode__') === 0));
    },

    skolemize: function(facts, elem) {
        var skolem = '';
        for (var i = 0; i < facts.length; i++) {
            skolem += facts[i].asString;
        }
        return md5(skolem) + elem;
    }
};

module.exports = Logics;
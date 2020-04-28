/**
 * Created by mt on 21/12/2015.
 */

var Utils = require('../Utils');

/**
 * Fact in the form subClassOf(a, b)
 * @param pred fact's/axiom name (e.g. subClassOf)
 * @param sub left individual
 * @param obj right individual
 * @param originFacts array of facts causing this
 * @constructor
 */
Fact = function(pred, sub, obj, causes, expl, graphs, consequences, notUsingValidity, fromTriple) {
    if(pred == 'FALSE') {
        this.falseFact = 'true';
    }
    if (causes === undefined) causes = [];
    if (expl === undefined) expl = true;
    if (graphs === undefined) graphs = [];
    if (consequences === undefined) consequences = [];
    this.matches = {};

    this.predicate = pred;
    this.subject = sub;
    this.object = obj;
    this.consequences = consequences;
    this.fromTriple = fromTriple;

    this.causedBy = causes;
    this.explicit = expl;
    this.graphs = graphs;

    if (!notUsingValidity && this.explicit) {
        this.valid = true;
    }

    this.constants = [];
    if (!Utils.isVariable(this.subject)) {
        this.constants.push(this.subject);
    }
    if (!Utils.isVariable(this.predicate)) {
        this.constants.push(this.predicate);
    }
    if (!Utils.isVariable(this.object)) {
        this.constants.push(this.object);
    }

    this.operatorPredicate = false;
    if (Utils.isOperator(this.predicate)) {
        this.operatorPredicate = true;
    }

    this.asString = this.asPlainString();
};

Fact.prototype = {

    /**
     * Convenient method to stringify a fact.
     * @returns {string}
     */

    asPlainString: function() {
        var e, spo;

        if(this.falseFact) {
            spo = 'FALSE';
        } else {
            spo = '(' + this.subject + ', ' + this.predicate + ', ' + this.object + ')'
        }

        this.explicit ? e = 'E' : e = 'I';
        return e + spo;
    },

    toString: function() {
        return this.asString;
    },

    toCHR: function(mapping) {
        var chrized;

        if(mapping === undefined) {
            mapping = {};
        }

        if(this.falseFact) {
            chrized = 'FALSE()';
        } else {
            chrized = 't(' + 
                this.subjectCHR(mapping) + ', ' + 
                this.predicateCHR(mapping) + ', ' + 
                this.objectCHR(mapping) + 
            ')';
        }

        return chrized;
    },

    toRaw: function() {
        var spo;

        if(this.falseFact) {
            spo = 'FALSE';
        } else {
            spo = '(' + this.subject + ' ' + this.predicate + ' ' + this.object + ')';
        }

        return spo;
    },

    subjectCHR: function(mapping) {
        return Utils.asCHRAtom(this.subject, mapping);
    },

    predicateCHR: function(mapping) {
        return Utils.asCHRAtom(this.predicate, mapping);
    },

    objectCHR: function(mapping) {
        return Utils.asCHRAtom(this.object, mapping);
    },

    truncatedString: function() {
        var e, spo;

        if(this.falseFact) {
            spo = 'FALSE';
        } else {
            spo = '(' + Utils.removeBeforeSharp(this.subject) + ', ' + Utils.removeBeforeSharp(this.predicate) + ', ' + Utils.removeBeforeSharp(this.object) + ')'
        }

        this.explicit ? e = 'E' : e = 'I';
        return e + spo;
    },

    /**
     * Checks if the fact is equivalent to another fact.
     * @param fact
     * @returns {boolean}
     */
    equivalentTo: function(fact) {
        if ((this.explicit != fact.explicit) ||
            (this.subject != fact.subject) ||
            (this.predicate != fact.predicate) ||
            (this.object != fact.object)) {
            return false;
        }
        return true;
    },

    hasSimilarPatternWith: function(fact) {
         return (
            Logics.similarAtoms(this.subject, fact.subject) &&
            Logics.similarAtoms(this.predicate, fact.predicate) &&
            Logics.similarAtoms(this.object, fact.object)
         );
    },

    /**
     * Returns the fact if it appears in a set of facts.
     * Returns false otherwise.
     * @param factSet
     */
    appearsIn: function(factSet) {
        var that = this;
        for (var key in factSet) {
            if(that.equivalentTo(factSet[key])){
                return key;
            }
        }
        return false;
    },

    /**
     * Checks the validity of an implicit fact
     * by exploring its explicit causes' validity tags.
     * An implicit fact is valid iff the disjunction of
     * its explicit causes' validity tags is true, i.e.
     * if at least one of its causes is valid.
     * @param fe
     * @returns {boolean}
     */
    isValid: function() {
        if (this.explicit) {
            return this.valid;
        } else if (this.causedBy === undefined || this.causedBy.length == 0) {
            return undefined;
        } else {
            var valid,
                causes = this.causedBy,
                explicitFact;
            for (var i = 0; i < causes.length; i++) {
                valid = true;
                for (var j = 0; j < causes[i].length; j++) {
                    explicitFact = causes[i][j];
                    valid = valid && explicitFact.valid;
                }
                if (valid) {
                    return true;
                }
            }
            return false;
        }
    },

    derives: function(kb) {
        var factsDerived = [];
        for (var i = 0; i < kb.length; i++) {
            if (this.appearsIn(kb[i].implicitCauses)) {
                factsDerived.push(kb[i]);
            } else {
                for (var j = 0; j < kb[i].causedBy.length; j++) {
                    if (this.appearsIn(kb[i].causedBy[j])) {
                        factsDerived.push(kb[i]);
                        break;
                    }
                }
            }
        }
        return factsDerived;
    },

    doPropagate: function(keptFact) {        
        if (this.__propagate__) {
            for (var i = 0; i < this.__propagate__.consequences.length; i++) {
                if (this.__propagate__.consequences[i] == this) {
                    this.__propagate__.consequences[i] = keptFact;         
                }
            }
        }
    }
};

module.exports = Fact;


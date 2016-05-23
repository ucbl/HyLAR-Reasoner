/**
 * Created by mt on 21/12/2015.
 */

var Logics = require('./Logics');
var Utils = require('../Utils');

/**
 * Fact in the form subClassOf(a, b)
 * @param pred fact's/axiom name (e.g. subClassOf)
 * @param sub left individual
 * @param obj right individual
 * @param originFacts array of facts causing this
 * @constructor
 */
Fact = function(pred, sub, obj, originConjs, expl, graphs, implicitCauses) {
    if(pred == 'FALSE') {
        this.falseFact = 'true'
    }
    if (originConjs === undefined) originConjs = [];
    if (graphs === undefined) graphs = [];
    if (expl === undefined) expl = true;
    if (implicitCauses === undefined) implicitCauses = [];

    this.predicate = pred;
    this.subject = sub;
    this.object = obj;
    this.implicitCauses = implicitCauses;

    this.causedBy = originConjs;
    this.explicit = expl;
    this.graphs = graphs;
    this.valid = true;

    this.constants = [];
    if (!Logics.isVariable(this.subject)) {
        this.constants.push(this.subject);
    }
    if (!Logics.isVariable(this.predicate)) {
        this.constants.push(this.predicate);
    }
    if (!Logics.isVariable(this.object)) {
        this.constants.push(this.object);
    }
};

Fact.prototype = {

    /**
     * Convenient method to stringify a fact.
     * @returns {string}
     */
    toString: function() {
        var e, spo;

        if(this.falseFact) {
            spo = 'FALSE';
        } else {
            spo = '(' + this.subject + ', ' + this.predicate + ', ' + this.object + ')'
        }

        this.explicit ? e = 'E' : e = 'I';
        return e + spo;
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
        } else {
            var valid = true,
                conj = this.causedBy,
                explicitFact;
            for (var i = 0; i < conj.length; i++) {
                for (var j = 0; j < conj[i].length; j++) {
                    explicitFact = conj[i][j];
                    valid = valid && explicitFact.valid;
                }
                if (valid) {
                    return true;
                }
            }
            return false;
        }
    },
    /*isValid: function(treated) {
        if (treated === undefined) treated = [];
        if (this.explicit) {
            return this.valid;
        }
        for (var i = 0; i < this.causedBy.length; i++) {
            var valid = true,
                conj = this.causedBy[i];
            for (var j = 0; j < conj.length; j++) {
                if (treated.toString().indexOf(conj[j]) === -1) {
                    treated.push(conj[j]);
                    valid = valid && conj[j].isValid(treated);
                } else {
                    return false;
                }
            }
            if (valid) {
                return true;
            }
        }
        return false;
    },*/

    implicitlyDerives: function(kb) {
        var factsDerived = [];
        for (var i = 0; i < kb.length; i++) {
            if (this.appearsIn(kb[i].implicitCauses)) {
                factsDerived.push(kb[i]);
            }
        }
        return factsDerived;
    },

    explicitlyDerives: function(kb) {
        var factsDerived = [];
        for (var i = 0; i < kb.length; i++) {
            for (var j = 0; j < kb[i].causedBy.length; j++) {
                if (this.appearsIn(kb[i].causedBy[j])) {
                    factsDerived.push(kb[i]);
                    break;
                }
            }
        }
        return factsDerived;
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

    isAlternativeEquivalentOf: function(fact) {
        return (
            (fact.subject == this.subject) &&
            (fact.predicate == this.predicate) &&
            (fact.object == this.object) &&
            (fact.explicit != this.explicit)
        );
    },

    findAlternativeEquivalent: function(kb) {
        var alternativeEquivalent;
        for (var i = 0; i < kb.length; i++) {
            alternativeEquivalent = this.isAlternativeEquivalentOf(kb[i]);
            if (alternativeEquivalent) {
                return kb[i];
            }
        }
        return false;
    }
};

module.exports = Fact;


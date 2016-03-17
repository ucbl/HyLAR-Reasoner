/**
 * Created by mt on 21/12/2015.
 */

/**
 * Fact in the form subClassOf(a, b)
 * @param name fact's/axiom name (e.g. subClassOf)
 * @param li left individual
 * @param ri right individual
 * @param originFacts array of facts causing this
 * @constructor
 */
Fact = function(name, li, ri, originConjs, expl, graphs) {
    if(originConjs === undefined) originConjs = [];
    if(graphs === undefined) graphs = [];
    if(expl === undefined) expl = true;

    this.predicate = name;
    this.subject = li;
    this.object = ri;
    this.causedBy = originConjs;
    this.explicit = expl;
    this.graphs = graphs;
    this.valid = true;
};

Fact.prototype = {

    /**
     * Convenient method to stringify a fact.
     * @returns {string}
     */
    toString: function() {
        var e;
        this.explicit ? e = 'E' : e = 'I';
        return e + '(' + this.subject + ', ' + this.predicate + ', ' + this.object + ')';
    },

    /**
     * Checks if the fact is equivalent to another fact.
     * @param fact
     * @returns {boolean}
     */
    equivalentTo: function(fact) {
        if ((this.subject != fact.subject) ||
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
                return that;
            }
        }
        return false;
    },

    isValid: function(fe) {
        for (var key in this.causedBy) {
            var valid = true,
                conj = this.causedBy[key];
            for (var i = 0; i < conj.length; i++) {
                for (var j = 0; j < fe.length; j++) {
                    if(fe[j] == conj[i]) {
                        valid = valid && fe[j].valid;
                        break;
                    }
                }
            }
            if (valid) {
                return true;
            }
        }
        return false;
    },

    setCauses: function(conjunction) {
        this.causedBy = [[]];
        this.explicit = false;
        for (var i = 0; i < conjunction.length; i++) {
            if(conjunction[i].causedBy.length > 0) {
                for (var j = 0; j < conjunction[i].causedBy.length; j++) {
                    this.causedBy[0] = this.causedBy[0].concat((conjunction[i].causedBy[j]));
                }
            } else {
                this.causedBy[0].push(conjunction[i].toString());
            }
        }
    }
};

module.exports = Fact;


/**
 * Created by aifb on 15.04.16.
 */

var Logics = require('./Logics');

AnnotatedQuery = function() {
    this.atoms = [];
};

AnnotatedQuery.atom = function(val) {
    if (Logics.isVariable(val.subject) || Logics.isVariable(val.predicate) || Logics.isVariable(val.object)) {
        this.annotation = 'EMPTY'
    } else {
        this.annotation = 'DIFF'
    }
    this.value = val;
};

AnnotatedQuery.prototype.addAtom = function(atom) {
    this.atoms.push(atom);
};

AnnotatedQuery.prototype.atomsLen = function() {
    return this.atoms.length;
};

AnnotatedQuery.prototype.getAtom = function(index) {
    return this.atoms[index];
};

AnnotatedQuery.prototype.setAtom = function(index) {
    return this.atoms[index];
};

module.exports = AnnotatedQuery;




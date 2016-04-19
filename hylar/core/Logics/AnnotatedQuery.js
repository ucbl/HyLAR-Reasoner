/**
 * Created by aifb on 15.04.16.
 */

var Logics = require('./Logics');

/**
 * Annotated query prototype
 * @constructor
 */
AnnotatedQuery = function() {
    this.atoms = [];
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

/**
 * Atom prototype
 * @param val
 */
AnnotatedQuery.atom = function(val) {
    if (Logics.isVariable(val.subject) || Logics.isVariable(val.predicate) || Logics.isVariable(val.object)) {
        this.annotation = 'DIFF'
    } else {
        this.annotation = 'EMPTY'
    }
    this.value = val;
};

AnnotatedQuery.atom.isEmpty = function() {
  return (this.annotation == 'EMPTY');
};

AnnotatedQuery.atom.isDiff = function() {
    return (this.annotation == 'DIFF');
};

module.exports = AnnotatedQuery;




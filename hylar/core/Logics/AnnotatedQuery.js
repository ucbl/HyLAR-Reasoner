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

AnnotatedQuery.prototype.toString = function() {
    var atomConj = '';
    for(var key in this.atoms) {
        atomConj += ' ^ ' + this.getAtom(key).toString();
    }
    return atomConj.substr(3);
};

/**
 * Atom prototype
 * @param val
 */
AnnotatedQuery.atom = function(val, annotateDiff) {
    if (annotateDiff === true) {
        this.annotation = 'DIFF'
    } else {
        this.annotation = ''
    }
    this.value = val;
};

AnnotatedQuery.atom.prototype.isEmpty = function() {
  return (this.annotation == '');
};

AnnotatedQuery.atom.prototype.isDiff = function() {
    return (this.annotation == 'DIFF');
};

AnnotatedQuery.atom.prototype.toString = function() {
    var annotationIndicator = this.annotation;
    if (this.isDiff()) {
        annotationIndicator = '[' + this.annotation + ']';
    }
    return this.value.toString() + annotationIndicator;
};

module.exports = AnnotatedQuery;




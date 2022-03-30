/**
 * Created by Spadon on 13/02/2015.
 */

var q = require('q');

var RegularExpressions = require('./RegularExpressions');
var EventEmitter = require('events').EventEmitter;
 

/** Event emitter */

var emitter = new EventEmitter();

emitter.on('started', function (task) {
    console.log('started ' + task);
});

emitter.on('finished', function (task) {
    console.log('processed ' + task);
});

Utils = {

    _instanceid: 1,

    emitter: emitter,

    /**
     * Returns a set of elements
     * with distinct string representation.
     * @param _set1
     * @param _set2
     * @returns {Array}
     */
    uniques: function (_set1, _set2) {
        var hash = {}, uniq = [],
            fullSet = _set1.concat(_set2);

        for (var i = 0; i < fullSet.length; i++) {
            if (fullSet[i] !== undefined) hash[fullSet[i].toString()] = fullSet[i];
        }

        for (var key in hash) {
            uniq.push(hash[key]);
        }
        return uniq;
    },

    insertUnique: function (_set, val) {
        return this.uniques(_set, [val]);
    },

    containsSubset: function (_set1, _set2) {
        return this.uniques(_set1, _set2).length == _set1.length
    },

    /**
     * Checks if a string is a variable,
     * @param str
     * @returns {boolean}
     */
    isVariable: function (str) {
        if (str === undefined) {
            return false;
        }
        try {
            return (str.indexOf('?') === 0);
        } catch (e) {
            return false;
        }
    },

    /**
     * Checks if a string is an operator (>, <, >=, <= or =)
     * @param str
     * @returns {boolean}
     */
    isOperator: function (str) {
        try {
            return ((str == '>') || (str == '<') || (str == '<=') || (str == '>=') || (str == '==') || (str == '!='));
        } catch (e) {
            return false;
        }
    },

    removeBeforeSharp: function (str) {
        if (str.indexOf('#') === -1 || str.charAt(0) === '"') return str;
        var splitted = str.split('#');
        return /*splitted[0].slice(0,10) + '...#' + */splitted[1];
    },

    equivalentSets: function (s1, s2) {
        if (s1.toString() == s2.toString()) {
            return true;
        }
        if (s1.length != s2.length) {
            return false;
        }
        for (var i = 0; i < s1.length; i++) {
            if (this.notInSet(s2, s1[i])) {
                return false;
            }
        }
        return true;
    },

    notInSet: function (s1, elem) {
        return (s1.toString().indexOf(elem.toString()) === -1);
    },

    getValueFromDatatype: function (datatype) {
        const rawMatchResults = datatype.match(RegularExpressions.LITERAL_RAW_VALUE);
        const literalWithoutTypeResults = datatype.match(RegularExpressions.LITERAL_WITHOUT_TYPE);

        if (!rawMatchResults && !literalWithoutTypeResults) return `"${datatype}"`;

        const rawValueMatch = rawMatchResults?.length > 1 ? rawMatchResults[1] : false;
        const literalWithoutTypeMatch = literalWithoutTypeResults?.length > 1 ? literalWithoutTypeResults[1] : false;
        if (isNaN(parseFloat(rawValueMatch))) {
            return literalWithoutTypeMatch;
        } else {
            return rawValueMatch;
        }
    },

    emptyPromise: function (toBeReturned) {
        var deferred = q.defer();
        deferred.resolve(toBeReturned);
        return deferred.promise;
    },

    tripleContainsVariable: function (triple) {
        if (this.isVariable(triple.subject)
            || this.isVariable(triple.predicate)
            || this.isVariable(triple.object)) {
            return true;
        }
        return false;
    },

    asCHRAtom: function (elem, mapping) {
        if (this.isVariable(elem)) {
            if (mapping[elem] === undefined) {
                if (mapping.__lastCHRVar) {
                    mapping.__lastCHRVar = String.fromCharCode(mapping.__lastCHRVar.charCodeAt(0) + 1);
                } else {
                    mapping.__lastCHRVar = 'A';
                }
                mapping[elem] = mapping.__lastCHRVar;
            }
            return mapping[elem];
        } else {
            return '"' + elem.replace(/[^a-zA-Z]/g, '') + '"';
        }
    },
    /**
     * Return true if the two atoms are either both variables, or
     * identical URIs.
     * @returns {boolean}
     */
    similarAtoms: function (atom1, atom2) {
        if (this.isVariable(atom1) && this.isVariable(atom2)) {
            return true;
        } else if (atom1 == atom2) {
            return true;
        } else {
            return false;
        }
    },
}
// export default Utils;
module.exports = Utils;
// for (const [prop, func] of Object.entries(Utils)) {
//     module.exports[prop] = func;
// }
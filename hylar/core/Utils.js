/**
 * Created by Spadon on 13/02/2015.
 */

var RegularExpressions = require('./RegularExpressions');

/**
 * Utility functions.
 */

var isArray = function(arr) {
    return (Object.prototype.toString.call(arr) === '[object Array]');
};

var IterableStructure = function(content) {
    this.arr = [];
    if (content !== undefined) {
        this.arr = content;
    }
    this.currentIndex = -1;
};

IterableStructure.prototype.next = function() {
    this.currentIndex++;
    if (this.currentIndex < this.arr.length) {
        return this.arr[this.currentIndex]
    }
    return false;
};

IterableStructure.prototype.contains = function(elem) {
    for (var i = 0; i < this.arr.length; i++) {
        if (this.arr[i].toString() == elem.toString()) {
            return true;
        }
    }
    return false;
};

IterableStructure.prototype.add = function(elem) {
    if (isArray(elem)) {
        for (var i = 0; i < elem.length; i++) {
            this.add(elem[i])
        }
    } else {
        if (this.contains(elem)) {
            return false;
        } else {
            this.arr.push(elem);
            return true;
        }
    }
};

IterableStructure.prototype.toArray = function() {
    return this.arr;
};

module.exports = {

    IterableStructure: IterableStructure,

    /**
     * Get the key referring to a value in a JSON object.
     * @param obj
     * @param value
     * @returns {*}
     */
    getKeyByValue: function(obj, value) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop) ) {
                if(obj[prop] === value )
                    return prop;
            }
        }
        return false;
    },

    /**
     * Returns a set of elements
     * with distinct string representation.
     * @param _set1
     * @param _set2
     * @returns {Array}
     */
    uniques: function(_set1, _set2) {
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

    insertUnique: function(_set, val) {
        return this.uniques(_set, [val]);
    },

    emptyObject: function(obj) {
        return (Object.keys(obj).length == 0)
    },

    containsSubset: function(_set1, _set2) {
        return this.uniques(_set1, _set2).length == _set1.length
    },

    removeEquivStrRepr: function(_set, elem) {
        for (var i = 0; i < _set.length; i++) {
            if (_set[i] !== undefined) {
                if (elem.toString() == _set[i].toString()) {
                    delete _set[i];
                }
            }
        }
    },

    removeSubset: function(mainSet, subSet) {
        var copiedSet = mainSet.slice(),
            resultSet = [];

        if (mainSet.toString() == subSet.toString()) return [];

        for (var i = 0; i < subSet.length; i++) {
            if (copiedSet.toString().indexOf(subSet[i].toString()) === -1) {
                return false;
            } else {
                this.removeEquivStrRepr(copiedSet, subSet[i]);
            }
        }

        for (var i = 0; i < copiedSet.length; i++) {
            if (copiedSet[i] !== undefined) {
                resultSet.push(copiedSet[i]);
            }
        }

        return resultSet;
    },

    removeFromSet: function(_set, elem) {
        var newSet;

        if (_set.toString().indexOf(elem.toString()) === -1) {
            return false;
        }

        newSet =  _set.slice();

        for (var i = 0; i < newSet.length; i++) {
            if (newSet[i].toString() == elem.toString()) {
                newSet.splice(i, 1);
                return newSet;
            }
        }
    },

    isArray: isArray,

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

    /**
     * Checks if a string is an operator (>, <, >=, <= or =)
     * @param str
     * @returns {boolean}
     */
    isOperator: function(str) {
        try {
            return ((str == '>') || (str == '<') || (str == '<=') || (str == '>=') || (str == '='));
        } catch(e) {
            return false;
        }
    },

    /**
     * Checks if a string is a datatype,
     * i.e. starts with dbl quotes, which is
     * not allowed for URIs.
     * @param str
     * @returns {boolean}
     */
    isDataType: function(str) {
        try {
            return (str.indexOf('"') === 0);
        } catch(e) {
            return false;
        }
    },

    isURI: function(str) {
        return (!this.isVariable(str) && !this.isDataType(str));
    },

    removeBeforeSharp: function(str) {
        if (str.indexOf('#') === -1 || str.charAt(0) === '"') return str;
        var splitted = str.split('#');
        return /*splitted[0].slice(0,10) + '...#' + */splitted[1];
    },

    equivalentSets: function(s1, s2) {
        if (s1.toString() == s2.toString()) {
            return true;
        }
        for (var i = 0; i < s1.length; i++) {
            if (this.notInSet(s2, s1[i])) {
                return false;
            }
        }
        return true;
    },

    notInSet: function(s1, elem) {
        return (s1.toString().indexOf(elem.toString()) === -1);
    },

    getValueFromDatatype: function(datatype) {
        var rawValueMatch = datatype.match(RegularExpressions.LITERAL_RAW_VALUE)[1],
           literalWithoutTypeMatch = datatype.match(RegularExpressions.LITERAL_WITHOUT_TYPE)[1];
        if (parseFloat(rawValueMatch) === NaN) {
            return literalWithoutTypeMatch;
        } else {
            return rawValueMatch;
        }
    }
};

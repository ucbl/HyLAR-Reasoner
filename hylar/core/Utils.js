/**
 * Created by Spadon on 13/02/2015.
 */

/**
 * Utility functions.
 */

var q = require('q');

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

IterableStructure.prototype.add = function(elem) {
    if (isArray(elem)) {
        for (var i = 0; i < elem.length; i++) {
            this.add(elem[i])
        }
    } else {
        for (var i = 0; i < this.arr.length; i++) {
            if (this.arr[i].toString() == elem.toString()) {
                return false;
            }
        }
        this.arr.push(elem);
        return true;
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
            hash[fullSet[i].toString()] = fullSet[i];
        }

        for (var key in hash) {
            uniq.push(hash[key]);
        }
        return uniq;
    },

    emptyObject: function(obj) {
        return (Object.keys(obj).length == 0)
    }
};

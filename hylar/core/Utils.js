/**
 * Created by Spadon on 13/02/2015.
 */

/**
 * Utility functions.
 */

var q = require('q');

module.exports = {

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
    }
};

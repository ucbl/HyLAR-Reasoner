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
    }
};

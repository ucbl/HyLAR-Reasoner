/**
 * Created by Spadon on 13/02/2015.
 */

var q = require('q');

module.exports = {

    ESCAPE_CHAR: '-----',

    escapeRegExp: function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    },

    booleize: function(str) {
        if (str === 'true') {
            return true;
        } else {
            return false;
        }
    },

    /**
     * Transforms a object into a stringified version
     * and replaces commas by '-' to avoid TrimPath exceptions.
     * @param json
     * @returns {*}
     */
    stringifyNoComma: function(json) {
        if(json.length == 0) return '';
        var str =JSON.stringify(json);
        return str.replace(/,/g, this.ESCAPE_CHAR)
                .replace(/"/g, '\"');
    },

    /**
     * Reversed stringifyNoComma function.
     * @param str
     */
    unStringifyAddCommas: function(str) {
        try {
            return JSON.parse(str.replace(/\\"/g, '"')
                                .replace(new RegExp(this.ESCAPE_CHAR, 'g'), ','));
        } catch(e) {
            return [];
        }
    },

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
     * Merges two maps.
     * @param mapToComplete
     * @param mapCompleter
     * @returns {{}}
     */
    completeMap: function(mapToComplete, mapCompleter) {
        var newMap = {}
        for(var key in mapToComplete) {
            newMap[key] = mapToComplete[key];
        }
        for(var key in mapCompleter) {
            var candidate = mapCompleter[key];
            if(!(this.getKeyByValue(newMap,candidate))) newMap[key] = mapCompleter[key];
        }
        return newMap;
    },

    getCombinations: function(arr, k) {
        var i,
            subI,
            ret = [],
            sub,
            next;
        for(i = 0; i < arr.length; i++){
            if(k === 1){
                ret.push( [ arr[i] ] );
            }else{
                sub = this.getCombinations(arr.slice(i+1, arr.length), k-1);
                for(subI = 0; subI < sub.length; subI++ ){
                    next = sub[subI];
                    next.unshift(arr[i]);
                    ret.push( next );
                }
            }
        }
        return ret;
    },

    getCombinationsMax: function(arr, max) {
        var combs = [];
        for(var i = 1; i <= max; i++) {
            combs = combs.concat(this.getCombinations(arr, i));
        }
        return combs;
    }

};

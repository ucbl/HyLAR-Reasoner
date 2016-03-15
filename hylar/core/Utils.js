/**
 * Created by Spadon on 13/02/2015.
 */

var _ = require('lodash');

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
                    return obj;
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

    /**
     * Simple HelloWorld
     * @param req
     * @param res
     */
    hello: function(req, res) {
        res.send('hello world');
    },

    /**
     * CORS Middleware
     * @param req
     * @param res
     */
    allowCrossDomain: function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    },

    /** Current server time */
    time: function(req, res) {
        res.send({
            milliseconds: new Date().getTime()
        });
    }

};

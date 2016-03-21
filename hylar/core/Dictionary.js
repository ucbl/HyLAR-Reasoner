/**
 * Created by Spadon on 13/11/2015.
 */

var Logics = require('./Logics/Logics');
var Utils = require('./Utils');
var ParsingInterface = require('./ParsingInterface');

var dict = {
};

module.exports = {
    get: function(ttl) {
        var fact = dict[ttl];
        if (fact) return fact;
        else return false;
    },

    put: function(fact) {
        for (var key in dict) {
            var value = dict[key];
            if(fact.equivalentTo(value)) {
                dict[key] = Logics.mergeFacts(fact, value);
                return true;
            }
        }
        try {
            dict[ParsingInterface.factToTurtle(fact)] = fact;
            return true;
        } catch(e) {
            return e;
        }
    },

    content: function() {
        return dict;
    },

    setContent: function(content) {
        dict = content;
    },

    values: function() {
        var values = [];
        for (var key in dict) {
            values.push(dict[key]);
        }
        return values;
    },

    findValues: function(triples) {
        var values = [], notfound = [],
            value;
        for (var i = 0; i < triples.length; i++) {
            value = dict[triples[i].toString().slice(0, -2)];
            if(value !== undefined) {
               values.push(value);
            } else {
               notfound.push(triples[i]);
            }
        }
        return {
            found: values,
            notfound: notfound
        };
    },

    findKeys: function(values) {
        var keys = [], value, notfound = [];
        for (var i = 0; i< values.length; i++) {
            value = values[i];
            var key = Utils.getKeyByValue(dict, value);
            if(key !== undefined) {
                keys.push(key)
            } else {
                notfound.push(value);
            }
        }
        return {
            found: keys,
            notfound: notfound
        };
    }
};
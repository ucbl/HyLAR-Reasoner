/**
 * Created by Spadon on 13/11/2015.
 */

/**
 * Dictionary used to index triples (in turtle) and their fact representation.
 * @type {{substractFactSets: Function, combine: Function}|exports|module.exports}
 */

var Utils = require('./Utils');
var ParsingInterface = require('./ParsingInterface');

function Dictionary() {
    this.dict = {};
};

/**
 * Returns the fact corresponding to the turtle triple.
 * @param ttl
 * @returns {*}
 */
Dictionary.prototype.get = function(ttl) {
    var fact = this.dict[ttl];
    if (fact) return fact;
    else return false;
};

/**
 * Updates the fact representation of
 * an existing turtle triple, or puts
 * a new one by transform the fact into turtle
 * through the ParsingInterface.
 * @param fact
 * @returns {*}
 */
Dictionary.prototype.put = function(fact) {
    try {
        this.dict[ParsingInterface.factToTurtle(fact)] = fact;
        return true;
    } catch(e) {
        return e;
    }
};

/**
 * Return the full content of the dictionary.
 * @returns {Object}
 */
Dictionary.prototype.content = function() {
    return this.dict;
};

/**
 * Sets dictionary's content.
 * @param content Object
 */
Dictionary.prototype.setContent = function(content) {
    this.dict = content;
};

/**
 * Gets all facts from the dictionary.
 * @returns {Array}
 */
Dictionary.prototype.values = function() {
    var values = [];
    for (var key in this.dict) {
        values.push(this.dict[key]);
    }
    return values;
};

/**
 * Gets facts corresponding to the turtle triples,returns an object
 * {found: facts found, notfound: turtle triples with no repr.}
 * @param triples An array of turtle triples.
 * @returns {{found: Array, notfound: Array}}
 */
Dictionary.prototype.findValues = function(triples) {
    var values = [], notfound = [],
        value;
    for (var i = 0; i < triples.length; i++) {
        value = this.dict[triples[i].toString().slice(0, -2)];
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
};

/**
 * Gets turtle triples corresponding to the facts,returns an object
 * {found: triples found, notfound: facts repr. nothing.}
 * @param values
 * @returns {{found: Array, notfound: Array}}
 */
Dictionary.prototype.findKeys = function(values) {
    var keys = [], value, notfound = [];
    for (var i = 0; i< values.length; i++) {
        value = values[i];
        var key = Utils.getKeyByValue(this.dict, value);
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
};

Dictionary.prototype.getFactFromStringRepresentation = function(factStr) {
    for (var key in this.dict) {
        if (this.dict[key].toString() == factStr) {
            return {
                key: key,
                value: this.dict[key]
            };
        }
    }
    return false;
};

module.exports = Dictionary;
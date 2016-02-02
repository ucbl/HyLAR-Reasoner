/**
 * Created by Spadon on 17/10/2014.
 */

/** Pair storage can be used to hash 2-tuples by the values in them in some order. */
var PairStorage = function () {
    /** Data structure holding all pairs. */
    this.storage = {};
};

/** Prototype for all jsw.util.PairStorage objects. */
PairStorage.prototype = {
    /**
     * Adds a new tuple to the storage.
     *
     * @param first Value of the first element of the tuple.
     * @param second Value for the second element of the tuple.
     */
    add: function (first, second) {
        var storage = this.storage;

        if (!storage[first]) {
            storage[first] = {};
        }

        storage[first][second] = true;
    },

    /**
     * Removes part of the relation specified by the arguments.
     *
     * @param first First value in the pairs to remove.
     * @param second (optional) Second value in the pairs to remove.
     */
    remove: function (first, second) {
        var firstPairs = this.storage[first];

        if (!firstPairs) {
            return;
        }

        if (second) {
            delete firstPairs[second];
        } else {
            delete this.storage[first];
        }
    },

    /**
     * Checks if the tuple with the given values exists within the storage.
     *
     * @param first First value in the pair.
     * @param second Second value in the pair.
     * @return boolean if the tuple with the given value exists, false otherwise.
     */
    exists: function (first, second) {
        var firstPairs = this.storage[first];

        if (!firstPairs) {
            return false;
        }

        return firstPairs[second] || false;
    },

    /**
     * Checks if tuples with the given first value and all of the given second values exist within
     * the storage.
     *
     * @param first First value in the tuple.
     * @param second Array containing the values for second element in the tuple.
     * @return boolean true if the storage contains all the tuples, false otherwise.
     */
    existAll: function (first, second) {
        var secondPairs, secondValue;

        if (!second) {
            return true;
        }

        secondPairs = this.storage[first];

        if (!secondPairs) {
            return false;
        }

        for (secondValue in second) {
            if (!secondPairs[secondValue]) {
// Some entity from subsumers array is not a subsumer.
                return false;
            }
        }

        return true;
    },

    /**
     * Returns an object which can be used to access all pairs in the storage with (optionally)
     * the fixed value of the first element in all pairs.
     *
     * @param first (optional) The value of the first element of all pairs to be returned.
     * @return Object which can be used to access all pairs in the storage.
     */
    get: function (first) {
        if (!first) {
            return this.storage;
        }

        return this.storage[first] || {};
    },

    getAllBut: function(entity) {
        var others = [];
        for (var key in this.storage[entity]) {
            if (key != entity) others.push(key);
        }
        return others;
    }
};

module.exports = {
    pairStorage: PairStorage
};

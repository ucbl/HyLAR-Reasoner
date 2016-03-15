/**
 * Created by Spadon on 17/10/2014.
 */

/**
 * Triple storage can be used to hash 3-tuples by the values in them in some order.
 *
 * @return Object which can be used to hash 3-tuples by the values in them in some order.
 */
var TripleStorage = function () {
    /**
     * Data structure holding all 3-tuples.
     */
    this.storage = {};
};

TripleStorage.prototype = {
    /**
     * Returns all Triples for a fixed value of the 1-st element in Triples and (optionally) the
     * 2-nd one.
     *
     * @param first Value of the first element of the returned Triples.
     * @param second (optional) Value of the second element of the returned Triples.
     * @return Object containing the Triples requested.
     */
    get: function (first, second) {
        var firstTuples;

        if (!first) {
            return this.storage;
        }

        firstTuples = this.storage[first];

        if (!firstTuples) {
            return {};
        }

        if (!second) {
            return firstTuples;
        }

        return firstTuples[second] || {};
    },

    /**
     * Adds the given Triple to the storage.
     *
     * @param first Value of the first element in the Triple.
     * @param second Value of the second element in the Triple.
     * @param third Value of the third element in the Triple.
     */
    add: function (first, second, third) {
        var storage = this.storage;

        if (!storage[first]) {
            storage[first] = {};
        }

        if (!storage[first][second]) {
            storage[first][second] = {};
        }

        storage[first][second][third] = true;
    },

    /**
     * Checks if the given Triple exists in the storage.
     *
     * @param first Value of the first element in the Triple.
     * @param second Value of the second element in the Triple.
     * @param third Value of the third element in the Triple.
     * @return (boolean) True if the value exists, false otherwise.
     */
    exists: function (first, second, third) {
        var storage = this.storage,
            firstStorage = storage[first],
            secondStorage;

        if (!firstStorage) {
            return false;
        }

        secondStorage = firstStorage[second];

        if (!secondStorage) {
            return false;
        }

        return secondStorage[third];


    }
};

module.exports = {
    tripleStorage: TripleStorage
};

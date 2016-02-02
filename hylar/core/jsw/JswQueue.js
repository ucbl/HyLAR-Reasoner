/**
 * Created by Spadon on 17/10/2014.
 */

/** Represents a queue implementing FIFO mechanism. */
var Queue = function () {
    this.queue = [];
    this.emptyElements = 0;
};

/** Prototype for all jsw.util.Queue objects. */
Queue.prototype = {
    /**
     * Checks if the queue has no objects.
     *
     * @return (boolean) True if there are no objects in the queue, fale otherwise.
     */
    isEmpty: function () {
        return this.queue.length === 0;
    },

    /**
     * Adds an object to the queue.
     *
     * @param obj Object to add to the queue.
     */
    enqueue: function (obj) {
        this.queue.push(obj);
    },

    /**
     * Removes the oldest object from the queue and returns it.
     *
     * @return The oldest object in the queue.
     */
    dequeue: function () {
        var element,
            emptyElements = this.emptyElements,
            queue = this.queue,
            queueLength = queue.length;

        if (queueLength === 0) {
            return null;
        }

        element = queue[emptyElements];
        emptyElements += 1;

        // If the queue has more than a half empty elements, shrink it.
        if (emptyElements << 1 >= queueLength - 1) {
            this.queue = queue.slice(emptyElements);
            this.emptyElements = 0;
        } else {
            this.emptyElements = emptyElements;
        }

        return element;
    }
};

module.exports = {
    queue: Queue
};


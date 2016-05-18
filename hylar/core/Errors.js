/**
 * Created by aifb on 02.05.16.
 */

module.exports = {
    IllegalFact: function(fact) {
        return new Error('Illegal fact: ' + fact.toString());
    },

    OrphanImplicitFact: function() {
        return new Error('Implicit facts could not have empty causes.')
    }
};
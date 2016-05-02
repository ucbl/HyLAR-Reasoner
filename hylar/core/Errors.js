/**
 * Created by aifb on 02.05.16.
 */

module.exports = {
    IllegalFact: function(fact) {
        return new Error('Illegal fact: ' + fact.toString());
    }
};
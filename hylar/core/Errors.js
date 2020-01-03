/**
 * Created by aifb on 02.05.16.
 */

module.exports = {
    IllegalFact: function(fact) {
        return new Error('Illegal fact: ' + fact.toString());
    },

    OrphanImplicitFact: function() {
        return new Error('Implicit facts could not have empty causes.')
    },

    StorageNotInitialized: function() {
        return new Error('Storage has not been initialized. Please load an ontology first.');
    },

    FileIO: function(filename) {
        return new Error('Cannot access ' + filename);
    },

    DBParsing: function(filename) {
        return new Error(`Cannot parse '${filename}' as graph database.`)
    },

    CountNotImplemented: function(expr) {
        return new Error(`COUNT statement currently only supports single wildcard (*) counts, got '${expr}'`)
    }
};
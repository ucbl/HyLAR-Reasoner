/**
 * Created by pc on 20/11/2015.
 */

var Prefixes = require('./Prefixes');

var rdfstore = require('rdfstore');
var q = require('q');

/**
 * Interface used for triple storage.
 * Relies on antonio garrote's rdfstore.js
 */

function TripleStorageManager() {
    //
}

    /**
     * Initializes the triplestore.
     * Register owl, rdfs and rdfs prefixes.
     * @returns {*}
     */
TripleStorageManager.prototype.init = async function() {
    var deferred = q.defer(),
        that = this;
    await new rdfstore.create(function(err, store) {
        if(err) {
            deferred.reject(err);
        } else {
            that.storage = store;
            that.storage.setPrefix('owl', Prefixes.OWL);
            that.storage.setPrefix('rdf', Prefixes.RDF);
            that.storage.setPrefix('rdfs', Prefixes.RDFS);
            deferred.resolve();
        }
    });
    return deferred.promise;
};

/**
 * Launches a query against the triplestore.
 * @param query
 * @returns {*}
 */
TripleStorageManager.prototype.query = function(query) {
    var deferred = q.defer();    
    query = query.replace(/\\/g, '').replace(/(\n|\r)/g, ' ');
    try {      
        this.storage.execute(query, function (err, r) {
            if(err) {            
                deferred.reject(new Error(`(SPARQL) ${err}`));
            } else {
                deferred.resolve(r !== undefined ? r : true)
            }
        });
    } catch(e) {
        deferred.reject(e);
    }
    return deferred.promise;
};

/**
 * Loads an ontology in the store.
 * @param data Raw ontology (str)
 * @param format Ontology mimetype
 * @returns {*}
 */
TripleStorageManager.prototype.load = function(data, format) {
    var deferred = q.defer();

    this.storage.load(format, data, function (err, r) {                
        if(err) {
            deferred.reject(err);
        } else {
            deferred.resolve(r);
        }
    });
    return deferred.promise;
};

/**
 * Empties the entire store.
 * @returns {*}
 */
TripleStorageManager.prototype.clear = function()  {
    return this.query('DELETE { ?a ?b ?c } WHERE { ?a ?b ?c }');
};

/**
 * Launches an insert query against
 * the triplestore.
 * @param ttl Triples to insert, in turtle.
 * @returns {*}
 */
TripleStorageManager.prototype.insert = async function(ttl, graph) {
    let ack = await this.query(`INSERT DATA { ${ttl} }`);
    if (graph !== undefined) {
        return (await this.query(`INSERT DATA { GRAPH <${graph}> { ${ttl} } }`)) && ack
    } else return ack
};

/**
 * Launches a delete query against
 * the triplestore.
 * @param ttl Triples to insert, in turtle.
 * @returns {*}
 */
TripleStorageManager.prototype.delete = async function(ttl, graph) {
    let ack = await this.query('DELETE DATA { ' + ttl + ' }');
    if (graph !== undefined) {
        return await this.query('DELETE DATA { GRAPH <' + graph + '> { ' + ttl + ' } { ' + ttl + ' } }')
    } else return ack
};

/**
 * Returns the content of the store,
 * for export purposes.
 * @returns {*}
 */
TripleStorageManager.prototype.getContent = function() {
    return this.query('CONSTRUCT { ?a ?b ?c } WHERE { ?a ?b ?c }');
};

/**
 * Loads content in the store,
 * for import purposes.
 * @param ttl Triples to import, in turtle.
 * @returns {*|Promise}
 */
TripleStorageManager.prototype.createStoreWith = function(ttl) {
    return this.clear().then(function() {
        return this.insert(ttl)
    });
};

TripleStorageManager.prototype.regenerateSideStore = function() {
    var deferred = q.defer(),
        that = this;

    new rdfstore.create(function(err, store) {
        that.sideStore = store;
        deferred.resolve();
    });
    return deferred.promise;
};

TripleStorageManager.prototype.loadIntoSideStore = function(ttl, graph) {
    var deferred = q.defer(),
        query = 'INSERT DATA { ' + ttl + ' }';

    if (graph) {
        query = 'INSERT DATA { GRAPH <' + graph + '> { ' + ttl + ' } }'
    }

    try {
        this.sideStore.execute(query,
            function (err, r) {
                deferred.resolve(r);
            });
    } catch(e) {
        deferred.reject(e + "\n@" + this.constructor.name);
        throw e;
    }

    return deferred.promise;
};

TripleStorageManager.prototype.querySideStore = function(query) {
    var deferred = q.defer();
    this.sideStore.execute(query,
        function(err, r) {
            deferred.resolve(r);
        });
    return deferred.promise;
};

module.exports = TripleStorageManager;
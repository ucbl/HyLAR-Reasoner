/**
 * Created by MT on 01/12/2015.
 */

var fs = require('fs'),
    path = require('path');

var Dictionary = require('./core/Dictionary'),
    ParsingInterface = require('./core/ParsingInterface'),
    StorageManager = require('./core/StorageManager'),
    Reasoner = require('./core/Reasoner'),
    OWL2RL = require('./core/OWL2RL'),
    Errors = require('./core/Errors');

var logFile = 'hylar.log';

console.notify = function(msg) {
    console.log('[HyLAR] ' + msg);
    try {
        fs.appendFileSync(logFile, new Date().toString() + ' ' + msg + '\n');
    } catch (e) {
        //return Errors.FileIO(logFile);
    }
};
console.warn = function(msg) {
    console.log('[HyLAR] WARNING: ' + msg);
    try {
        fs.appendFileSync(logFile, new Date().toString() + ' ' + msg + '\n');
    } catch (e) {
        //return Errors.FileIO(logFile);
    }
};


/**
 * HyLAR main module.
 * @author Mehdi Terdjimi
 * @organization LIRIS, Universite Lyon 1
 * @email mehdi.terdjimi@univ-lyon1.fr
 */

function Hylar() {
    this.dict = new Dictionary();
    this.sm = new StorageManager();
    this.rules = OWL2RL.rules;
}

/**
 * Puts on incremental reasoning
 */
Hylar.prototype.setIncremental = function() {
    this.rMethod = Reasoner.process.it.incrementally;
    console.notify('Reasoner set as incremental.');
};

/**
 * Puts on tag-based reasoning
 */
Hylar.prototype.setTagBased = function() {
    this.rMethod = Reasoner.process.it.tagBased;
    console.notify('Reasoner set as tag-based.');
};

/**
 * Puts on tag-based reasoning using backward/forward algorithm
 */
Hylar.prototype.setIncrementalBf = function() {
    this.rMethod = Reasoner.process.it.incrementallyBf;
    console.notify('Reasoner set as incremental b/f.');
};

Hylar.prototype.setRules = function(rules) {
    this.rules = rules;
};

/**
 * Switches HyLAR's reasoning method
 * @param method Name of the method ('incremental' or 'tagBased')
 */
Hylar.prototype.updateReasoningMethod = function(method) {
    switch(method) {
        case 'tagBased':
            this.setTagBased();
            break;
        case 'incremental':
            this.setIncremental();
            break;
        case 'incrementalBf':
            this.setIncrementalBf();
            break;
        default:
            if (this.rMethod === undefined) {
                this.setIncremental();
            }
            break;
    }
};

/**
 * Intializes the triple store, loads/classifies an ontology and register its
 * entities into the Dictionary.
 * @param ontologyTxt The raw ontology text
 * @param mimeType The specified mime type
 * @param reasoningMethod The desired reasoning method for the classification
 * @returns {*}
 */
Hylar.prototype.load = function(ontologyTxt, mimeType, reasoningMethod) {
    var that = this;
    this.updateReasoningMethod(reasoningMethod);
    this.dict.setContent({});

    return this.sm.init().then(function() {
        switch(mimeType) {
            case 'application/xml':
                return that.sm.loadRdfXml(ontologyTxt)
                    .then(function() {
                        console.notify('Store initialized successfully.');
                        return that.classify();
                    });
                break;
            case 'application/rdf+xml':
                return that.sm.loadRdfXml(ontologyTxt)
                    .then(function() {
                        return that.classify();
                    });
                break;
            case false:
                console.error('Unrecognized or unsupported mimetype. ' +
                    'Supported formats are rdf/xml, jsonld, turtle, n3');
                return false;
                break;
            default:
                return that.sm.load(ontologyTxt, mimeType)
                    .then(function() {
                        return that.classify();
                    }, function(error) {
                        console.error(error);
                        throw error;
                    });
        }
    });
};

/**
 * Launches a SPARQL query against the triplestore.
 * @param query The SPARQL query text
 * @param reasoningMethod The desired reasoning method if inserting/deleting
 */
Hylar.prototype.query = function(query, reasoningMethod) {
    var sparql = ParsingInterface.parseSPARQL(query);

    this.updateReasoningMethod(reasoningMethod);

    if (this.sm.storage === undefined) {
        throw Errors.StorageNotInitialized();
    } else {

        switch (sparql.type) {
            case 'update':
                return this.treatUpdate(sparql);
                break;
            default:
                return this.treatSelectOrConstruct(query);
        }
    }
};

/**
 * Returns the content of the triplestore as turtle.
 * @returns {String}
 */
Hylar.prototype.getStorage = function() {
    return this.sm.getContent()
        .then(function(content) {
            return content.triples.toString();
        });
};

/**
 * Empties and recreate the triplestore with elements
 * indicated in turtle/n3.
 * @param ttl The turtle/n3 triples to be added.
 * @returns {*}
 */
Hylar.prototype.setStorage = function(ttl) {
    return this.sm.createStoreWith(ttl);
};

/**
 * Returns the dictionary content.
 * @returns {Object}
 */
Hylar.prototype.getDictionary = function() {
    return this.dict;
};

/**
 * Empties and recreate the content of the dictionary.
 * @param dict The content of the dictionary.
 */
Hylar.prototype.setDictionaryContent = function(dict) {
    this.dict.setContent(dict);
};

Hylar.prototype.checkConsistency = function() {
    var __FALSE__ = this.getDictionary().dict['__FALSE__'],
        isConsistent = true, inconsistencyReasons;

    if (__FALSE__ !== undefined) {
        if ( (this.isIncremental()) || (this.isTagBased() && __FALSE__[0].isValid()) ) {
            isConsistent = false;
            inconsistencyReasons = __FALSE__.causedBy;
        }
    }

    return {
        consistent: isConsistent,
        trace: inconsistencyReasons
    }
};

Hylar.prototype.isTagBased = function() {
    return (this.rMethod == Reasoner.process.it.tagBased);
};

Hylar.prototype.isIncremental = function() {
    return (this.rMethod == Reasoner.process.it.incrementally);
};

/**
 * Processes update queries.
 * @param sparql The query text.
 * @returns {Object} The results of this query.
 */
Hylar.prototype.treatUpdate = function(sparql) {
    var that = this,
        iTriples = [],
        dTriples = [],
        FeIns, FeDel, F = [],
        turtle, update, insertion, deletion, kbT, insDel;

    for (var i = 0; i < sparql.updates.length; i++) {
        update = sparql.updates[i];
        if(update.insert) {
            console.notify('Starting insertion.');
            for (var j = 0; j < update.insert.length; j++) {
                insertion = update.insert[j];
                iTriples = iTriples.concat(insertion.triples);
            }
        }
        if(update.delete) {
            console.notify('Starting deletion.');
            for (var j = 0; j < update.delete.length; j++) {
                deletion = update.delete[j];
                dTriples = iTriples.concat(deletion.triples);
            }
        }
    }

    F = that.getDictionary().values();
    FeIns = ParsingInterface.triplesToFacts(iTriples, true, (that.rMethod == Reasoner.process.it.incrementally));
    FeDel = ParsingInterface.triplesToFacts(dTriples, true, (that.rMethod == Reasoner.process.it.incrementally));

    return Reasoner.evaluate(FeIns, FeDel, F, that.rMethod, that.rules)
        .then(function(derivations) {
            that.registerDerivations(derivations);
            insDel = {
                insert: ParsingInterface.factsToTurtle(derivations.additions),
                delete: ParsingInterface.factsToTurtle(derivations.deletions)
            };
            console.notify('Update completed.');
            return insDel;
        })
        .then(function(obj) {
            turtle = obj;
            if(turtle.delete != '') return that.sm.delete(turtle.delete);
            else return true;
        })
        .then(function() {
            if(turtle.insert != '') return that.sm.insert(turtle.insert);
            else return true;
        });
};

/**
 * Processes select or construct queries.
 * @param query The query text.
 * @returns {Object} The results of this query.
 */
Hylar.prototype.treatSelectOrConstruct = function(query) {
    var that = this;
    if (this.rMethod == Reasoner.process.it.tagBased) {
        var val, blanknodes, facts, triples,
            parsedQuery = ParsingInterface.parseSPARQL(query),
            queryType = parsedQuery.queryType;

        return this.sm.query(query)
            .then(function(r) {
                if(queryType == 'SELECT') {
                    triples = ParsingInterface.constructTriplesFromResultBindings(parsedQuery, r)
                } else {
                    triples = r.triples;
                }

                val = that.dict.findValues(triples);
                facts = val.found;
                blanknodes = val.notfound;
                return {
                    results: r,
                    filtered: Reasoner.engine.tagFilter(facts, that.dict.values())
                }
            })
            .then(function(r) {
                var ttl = that.dict.findKeys(r.filtered).found;
                if(queryType == 'SELECT') {
                    var reformedResults = ParsingInterface.reformSelectResults(parsedQuery, r.results, ttl.concat(blanknodes));
                    return reformedResults;
                } else {
                    return ParsingInterface.reformConstructResults(r.results, ttl, blanknodes);
                }
            });

    } else {
        return this.sm.query(query);
    }
};

/**
 * Registers newly inferred derivations
 * in the Dictionary.
 * @param derivations The derivations to be registered.
 */
Hylar.prototype.registerDerivations = function(derivations) {
    var factsToBeAdded = derivations.additions,
        factsToBeDeleted = derivations.deletions;
    console.notify('Registering derivations to dictionary...');

    for (var i = 0; i < factsToBeDeleted.length; i++) {
        if (factsToBeDeleted[i].toString() == 'IFALSE') {
            delete this.dict.dict['__FALSE__'];
        } else {
            delete this.dict.dict[ParsingInterface.factToTurtle(factsToBeDeleted[i])];
        }
    }

    for (var i = 0; i < factsToBeAdded.length; i++) {
        this.dict.put(factsToBeAdded[i]);
    }

    console.notify('Registered successfully.');
};

/**
 * Classifies the ontology
 * already loaded in the triplestore.
 * @returns {*}
 */
Hylar.prototype.classify = function() {
    var that = this;
    console.notify('Classification started.');

    return this.sm.query('CONSTRUCT { ?a ?b ?c } WHERE { ?a ?b ?c }')
        .then(function(r) {
            var facts = [], triple, fs, f;

            for (var i = 0; i <  r.triples.length; i++) {
                triple = r.triples[i];
                if(!(
                        triple.subject.interfaceName == "BlankNode" ||
                        triple.predicate.interfaceName == "BlankNode" ||
                        triple.object.interfaceName == "BlankNode"
                    )) {
                    fs = that.dict.get(triple);
                    if(!fs) {
                        f = ParsingInterface.tripleToFact(triple, true, (that.rMethod == Reasoner.process.it.incrementally));
                        that.dict.put(f);
                        facts.push(f);
                    } else {
                        facts = facts.concat(fs);
                    }
                }

            }
            return Reasoner.evaluate(facts, [], [], that.rMethod, that.rules);
        })
        .then(function(r) {
            that.registerDerivations(r);
            return ParsingInterface.factsToTurtle(r.additions);
        })
        .then(function(ttl) {
            console.notify('Classification succeeded.');
            return that.sm.insert(ttl.replace(/(\n|\r)/g, ''));
        });
};

module.exports = Hylar;

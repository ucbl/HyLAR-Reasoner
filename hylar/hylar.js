/**
 * Created by MT on 01/12/2015.
 */

var fs = require('fs'),
    path = require('path'),
    colors = require('colors');

var Dictionary = require('./core/Dictionary'),
    ParsingInterface = require('./core/ParsingInterface'),
    StorageManager = require('./core/StorageManager'),
    Reasoner = require('./core/Reasoner');
    OWL2RL = require('./core/OWL2RL');

console.notify = function(msg) {
    console.log(colors.green('[HyLAR] ') + msg);
    fs.appendFileSync('hylar.log', new Date().toString() + ' ' + msg + '\n');
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

    switch(sparql.type) {
        case 'update':
            return this.treatUpdate(sparql);
            break;
        default:
            return this.treatSelectOrConstruct(query);
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
    return this.dict.content();
};

/**
 * Empties and recreate the content of the dictionary.
 * @param dict The content of the dictionary.
 */
Hylar.prototype.setDictionaryContent = function(dict) {
    this.dict.setContent(dict);
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
        turtle, update, insertion, deletion, kbT;

    return this.sm.query(
            'CONSTRUCT { ?a ?b ?c } ' +
            'WHERE { ?a ?b ?c . }')
        .then(function(r) {
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

            for (var i = 0; i < r.triples.length; i++) {
                kbT = r.triples[i];
                if (!(
                        kbT.subject.interfaceName == "BlankNode" ||
                        kbT.predicate.interfaceName == "BlankNode" ||
                        kbT.object.interfaceName == "BlankNode"
                    )) {
                    var f = that.dict.get(kbT.toString().slice(0,-2));
                    if(!f) f = ParsingInterface.tripleToFact(kbT);
                    F.push(f);
                }
            }

            FeIns = ParsingInterface.triplesToFacts(iTriples);
            FeDel = ParsingInterface.triplesToFacts(dTriples);

            return Reasoner.evaluate(FeIns, FeDel, F, that.rMethod, that.rules)
        })
        .then(function(derivations) {
            that.registerDerivations(derivations);
            return {
                insert: ParsingInterface.factsToTurtle(derivations.additions),
                delete: ParsingInterface.factsToTurtle(derivations.deletions)
            }
        })
        .then(function(obj) {
            turtle = obj;
            if(turtle.delete != '') return that.sm.delete(turtle.delete);
            else return true;
        })
        .then(function(d) {
            if(turtle.insert != '') return that.sm.insert(turtle.insert);
            else return true;
        });
    console.notify('Update completed.');
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
    var facts = derivations.additions;
    console.notify('Registering derivations to dictionary...');

    for (var i = 0; i < facts.length; i++) {
        this.dict.put(facts[i]);
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
            var facts = [], triple;

            for (var i = 0; i <  r.triples.length; i++) {
                triple = r.triples[i];
                if(!(
                        triple.subject.interfaceName == "BlankNode" ||
                        triple.predicate.interfaceName == "BlankNode" ||
                        triple.object.interfaceName == "BlankNode"
                    )) {
                    var f = that.dict.get(triple);
                    if(!f) {
                        f = ParsingInterface.tripleToFact(triple);
                        that.dict.put(f);
                    }
                    facts.push(f);
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

/**
 * Created by MT on 01/12/2015.
 */

var fs = require('fs'),
    chalk = require('chalk'),
    q = require('q');

var Promise = require('bluebird');

var emitter = require('./core/Emitter');

var Dictionary = require('./core/Dictionary'),
    ParsingInterface = require('./core/ParsingInterface'),
    TripleStorageManager = require('./core/TripleStorageManager'),
    Logics = require('./core/Logics/Logics'),
    Reasoner = require('./core/Reasoner'),
    OWL2RL = require('./core/OWL2RL'),
    Fact = require('./core/Logics/Fact'),
    Utils = require('./core/Utils');

var logFile = 'hylar.log';

console.notify = function(msg) {
    console.log(chalk.green('[HyLAR] ') + msg);
    try {
        fs.appendFileSync(logFile, new Date().toString() + ' ' + msg + '\n');
    } catch (e) {
        //return Errors.FileIO(logFile);
    }
};
console.warn = function(msg) {
    console.log(chalk.yellow('[HyLAR] WARNING: ') + msg);
    try {
        fs.appendFileSync(logFile, new Date().toString() + ' ' + msg + '\n');
    } catch (e) {
        //return Errors.FileIO(logFile);
    }
};
console.error = function(msg) {
    console.log(chalk.white.bgRed('[HyLAR]') + ' ' + chalk.bold('ERROR:') + ' ' + msg);
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

Hylar = function() {
    this.dict = new Dictionary();
    this.sm = new TripleStorageManager();
    this.rules = OWL2RL.test;
    this.queryHistory = [];
    this.sm.init();
    this.computeRuleDependencies();  
};

Hylar.prototype.computeRuleDependencies = function() {
    Reasoner.updateRuleDependencies(this.rules);        
};      

Hylar.prototype.clean = function() {
    this.dict = new Dictionary();
    this.sm = new StorageManager();
    this.sm.init();
};

/**
 * Puts on incremental reasoning
 */
Hylar.prototype.setIncremental = function() {
    this.rMethod = Reasoner.process.it.incrementally;
    this.dict.turnOffForgetting();
    console.notify('Reasoner set as incremental.');
};

/**
 * Puts on tag-based reasoning
 */
Hylar.prototype.setTagBased = function() {
    this.rMethod = Reasoner.process.it.tagBased;
    this.dict.turnOnForgetting();
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
 * @param graph (optional) The graph in which the ontology will be loaded
 * @param keepOldValues (optional - default: false) Avoid storage cleaning if set to true.
 * @returns {*}
 */
Hylar.prototype.load = function(ontologyTxt, mimeType, keepOldValues, graph, reasoningMethod) {
    var that = this;
    emitter.emit('classif-started');
    this.updateReasoningMethod(reasoningMethod);

    if (!keepOldValues) {
        this.dict.clear();
        return this.sm.init().then(function() {
            return that.treatLoad(ontologyTxt, mimeType, graph);
        });
    } else {
        return this.treatLoad(ontologyTxt, mimeType, graph);
    }
};

Hylar.prototype.treatLoad = function(ontologyTxt, mimeType, graph) {
    var that = this;
    switch(mimeType) {
        case 'application/xml':
            return that.sm.loadRdfXml(ontologyTxt, graph)
                .then(function() {
                    console.notify('Store initialized successfully.');
                    return that.classify();
                });
            break;
        case 'application/rdf+xml':
            return that.sm.loadRdfXml(ontologyTxt, graph)
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

            return that.sm.load(ontologyTxt, mimeType, graph)
                .then(function() {
                    return that.classify();
                }, function(error) {                    
                    console.error(error);
                    throw error;
                });
    }
};

/**
 * Launches a SPARQL query against the triplestore.
 * @param query The SPARQL query text
 * @param reasoningMethod The desired reasoning method if inserting/deleting
 */
Hylar.prototype.query = function(query, reasoningMethod) {
    var sparql = ParsingInterface.parseSPARQL(query),
        singleWhereQueries = [], that = this;

    this.updateReasoningMethod(reasoningMethod);

    if (this.sm.storage === undefined) {
        this.sm.init();
    } else {
        switch (sparql.type) {
            case 'update':
                if (ParsingInterface.isUpdateWhere(sparql)) {
                    return this.query(ParsingInterface.updateWhereToConstructWhere(query))
                        .then(function(data) {
                            return that.query(ParsingInterface.buildUpdateQueryWithConstructResults(sparql, data));
                        });
                } else {
                    return this.treatUpdateWithGraph(query);
                }
                break;
            default:
                if (this.rMethod == Reasoner.process.it.incrementally) {
                    return that.sm.query(query);
                }
                return that.sm.regenerateSideStore()
                    .then(function(done) {
                        for (var i = 0; i < sparql.where.length; i++) {
                            singleWhereQueries.push(ParsingInterface.isolateWhereQuery(sparql, i));
                        }
                        return Promise.reduce(singleWhereQueries, function(previous, singleWhereQuery) {
                            return that.treatSelectOrConstruct(singleWhereQuery);
                        }, 0);
                    })
                    .then(function(done) {
                        return that.sm.querySideStore(query);
                    });
        }
    }
};

/**
 * High-level treatUpdate that takes graphs into account.
 * @returns Promise
 */
Hylar.prototype.treatUpdateWithGraph = function(query) {    
    var sparql = ParsingInterface.parseSPARQL(query),
        promises = [], updates;

    for (var i = 0; i < sparql.updates.length; i++) {
        if (sparql.updates[i].updateType == 'insert') {
            updates = sparql.updates[i].insert;
        } else if (sparql.updates[i].updateType == 'delete') {
            updates = sparql.updates[i].delete;
        }
        for (var j = 0; j < updates.length; j++) {
            promises.push(this.treatUpdate(updates[j], sparql.updates[i].updateType));
        }
    }
    return Promise.all(promises).then(function(values) {
        return [].concat.apply([], values);
    });
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

Hylar.prototype.getRulesAsStringArray = function() {
    var strRules = [];
    for (var i = 0; i < this.rules.length; i++) {
        strRules.push({ name: this.rules[i].name, rule: this.rules[i].toString() } );
    }
    return strRules;
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

Hylar.prototype.import = function(dictionary) {
    var importedTriples = "",
        dictContent = dictionary.dict;
    for (var graph in dictContent) {
        for (var triple in dictContent[graph]) {
            importedTriples += triple.replace(/(\n|\r|\\)/g, '') + "\n";
            for (var i = 0; i < dictContent[graph][triple].length; i++) {
                dictContent[graph][triple][i].__proto__ = Fact.prototype;
            }
        }
    }
    this.setDictionaryContent(dictContent);
    return this.sm.load(importedTriples, "text/turtle");
};

Hylar.prototype.checkConsistency = function() {
    var __FALSE__ = this.getDictionary().dict['#default']['__FALSE__'],
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
Hylar.prototype.treatUpdate = function(update, type) {
    var that = this,
        graph = update.name,
        iTriples = [],
        dTriples = [],
        FeIns, FeDel, F = this.getDictionary().values(graph),
        turtle, insDel, deleteQueryBody, promises = [],
        initialResponse = Utils.emptyPromise([ { triples:[] } ]);

    if(type == 'insert') {
        console.notify('Starting insertion.');
        iTriples = iTriples.concat(update.triples);

    } else if(type  == 'delete') {
        console.notify('Starting deletion.');
        for (var i = 0; i < update.triples.length; i++) {
            if (Utils.tripleContainsVariable(update.triples[i])) {
                deleteQueryBody = ParsingInterface.tripleToTurtle(update.triples[i]);
                promises.push(this.sm.query('CONSTRUCT { ' + deleteQueryBody + " }  WHERE { " + deleteQueryBody + " }"));
            } else {
                dTriples.push(update.triples[i]);
            }
        }
        initialResponse = Promise.all(promises);
    }

    return initialResponse

        .then(function(results) {
            for (var i = 0; i < results.length; i++) {
                dTriples = dTriples.concat(results[i].triples);
            }
            FeIns = ParsingInterface.triplesToFacts(iTriples, true, (that.rMethod == Reasoner.process.it.incrementally));
            FeDel = ParsingInterface.triplesToFacts(dTriples, true, (that.rMethod == Reasoner.process.it.incrementally));
            return Reasoner.evaluate(FeIns, FeDel, F, that.rMethod, that.rules)

        }).then(function(derivations) {
            that.registerDerivations(derivations, graph);
            insDel = {
                insert: ParsingInterface.factsToTurtle(derivations.additions),
                delete: ParsingInterface.factsToTurtle(derivations.deletions)
            };
            console.notify('Update completed.');
            return insDel;
        })

        .then(function(obj) {
            turtle = obj;
            if(turtle.delete != '') return that.sm.delete(turtle.delete, graph);
            else return true;
        })

        .then(function() {
            if(turtle.insert != '') return that.sm.insert(turtle.insert, graph);
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
        var val, blanknodes, facts, triples, temporaryData, sideStoreIndex,
            parsedQuery= ParsingInterface.parseSPARQL(query),
            graph = parsedQuery.where[0].name,
            constructEquivalentQuery = ParsingInterface.constructEquivalentQuery(query, graph);

        return this.sm.query(constructEquivalentQuery)
            .then(function(r) {
                triples = r.triples;
                val = that.dict.findValues(triples, graph);
                facts = val.found;
                blanknodes = val.notfound;
                return {
                    results: r,
                    filtered: Reasoner.engine.tagFilter(facts, that.dict.values(graph))
                }
            })
            .then(function(r) {
                temporaryData = that.dict.findKeys(r.filtered, graph).found.join(' ');
                return that.sm.loadIntoSideStore(temporaryData, graph);
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
Hylar.prototype.registerDerivations = function(derivations, graph) {
    var factsToBeAdded = derivations.additions,
        factsToBeDeleted = derivations.deletions;
    graph = this.dict.resolveGraph(graph);
    console.notify('Registering derivations to dictionary...');

    for (var i = 0; i < factsToBeDeleted.length; i++) {
        if (factsToBeDeleted[i].toString() == 'IFALSE') {
            delete this.dict.dict[graph]['__FALSE__'];
        } else {
            delete this.dict.dict[graph][ParsingInterface.factToTurtle(factsToBeDeleted[i])];
        }
    }

    for (var i = 0; i < factsToBeAdded.length; i++) {
        this.dict.put(factsToBeAdded[i], graph);
    }

    console.notify('Registered successfully.');
};

/**
 * Classifies the ontology
 * already loaded in the triplestore.
 * @returns {*}
 */
Hylar.prototype.classify = function() {
    var that = this, factsChunk, chunks = [], chunksNb = 5000, insertionPromises = [];
    console.notify('Classification started.');
    
    return this.sm.query('CONSTRUCT { ?a ?b ?c } WHERE { ?a ?b ?c }')
        .then(function(r) {
            var facts = [], triple, _fs, f;
            for (var i = 0; i <  r.triples.length; i++) {
                triple = r.triples[i];
                /*if(!(
                        triple.subject.interfaceName == "BlankNode" ||
                        triple.predicate.interfaceName == "BlankNode" ||
                        triple.object.interfaceName == "BlankNode"
                    )) {*/
                    _fs = that.dict.get(triple);
                    if(!_fs) {
                        f = ParsingInterface.tripleToFact(triple, true, (that.rMethod == Reasoner.process.it.incrementally));
                        that.dict.put(f);
                        facts.push(f);
                    } else {
                        facts = facts.concat(_fs);
                    }
                //}

            }
            return Reasoner.evaluate(facts, [], [], that.rMethod, that.rules);
        })
        .then(function(r) {                                   
            that.registerDerivations(r);
            for (var i = 0, j = r.additions.length; i < j; i += chunksNb) {
                factsChunk = r.additions.slice(i,i+chunksNb);
                chunks.push(ParsingInterface.factsToTurtle(factsChunk));
            }
            return;
        })
        .then(function() {            
            console.notify('Classification succeeded.');
            
            return Promise.reduce(chunks, function(previous, chunk) {                
                return that.sm.insert(chunk);
            }, 0);
        })
        .then(function() {
            emitter.emit('classif-ended');
            return true;
        });
};

/**
 * Add rules to the reasoner for
 * the next inferences.
 * @param ruleSet
 */
Hylar.prototype.addRules = function(ruleSet) {
    this.rules = this.rules.concat(ruleSet);
};

Hylar.prototype.addRule = function(rule, name) {
    this.rules.push(rule);
    this.rules[this.rules.length-1].setName(name);
};

Hylar.prototype.parseAndAddRule = function(rawRule, name) {
    var rule;
    try {
        rule = Logics.parseRule(rawRule, name);
    } catch(e) {
        console.error('Error when parsing rule ' + rule);
        return;
    }
    this.rules.push(rule);
};

Hylar.prototype.removeRule = function(nameOrRaw) {
    var newRules = [],
        parsedRule = '';
    try {
        parsedRule = Logics.parseRule(nameOrRaw);
    } catch(e) {}
    for (var i = 0; i < this.rules.length; i++) {
        if ((this.rules[i].name != nameOrRaw) && (this.rules[i].toString() != parsedRule.toString())) {
            newRules.push(this.rules[i]);
        } else {
            console.notify("Removed rule " + this.rules[i].toString());
        }
    }
    this.rules = newRules;
};

Hylar.prototype.getRuleName = function(raw) {
    var newRules = [],
        parsedRule = '';
    try {
        parsedRule = Logics.parseRule(raw);
    } catch(e) {
        console.error('Error when parsing rule ' + raw);
        return
    }

    for (var i = 0; i < this.rules.length; i++) {
        if (this.rules[i].toString() == parsedRule.toString()) {
            return this.rules[i].name;
        }
    }
};

Hylar.prototype.getRuleId = function(raw) {
    var newRules = [],
        parsedRule = '';
    try {
        parsedRule = Logics.parseRule(raw);
    } catch(e) {
        console.error('Error when parsing rule ' + raw);
        return
    }

    for (var i = 0; i < this.rules.length; i++) {
        if (this.rules[i].toString() == parsedRule.toString()) {
            return i;
        }
    }
};

Hylar.prototype.removeRuleById = function(index) {
    var newRules = [];
    for (var i = 0; i < this.rules.length; i++) {
        if (i!=index) {
            newRules.push(this.rules[i]);
        } else {
            console.notify("Removed rule " + this.rules[i].toString());
        }
    }
    this.rules = newRules;
};

Hylar.prototype.addToQueryHistory = function(query, noError) {
    this.queryHistory.push({ query: query, noError: noError });
};

Hylar.prototype.resetRules = function() {
    this.rules = OWL2RL.rules;
};

Hylar.prototype.quiet = function() {
    console.notify = function(){};
};

module.exports = Hylar;

/**
 * Created by MT on 01/12/2015.
 */

var fs = require('fs'),
    chalk = require('chalk'),
    chalkRainbow = require('chalk-rainbow')
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
    Utils = require('./core/Utils'),
    Errors = require('./core/Errors')

var logFile = 'hylar.log';

/**
 * HyLAR main module.
 * @author Mehdi Terdjimi
 * @organization LIRIS, Universite Lyon 1
 * @email mehdi.terdjimi@univ-lyon1.fr
 */

Hylar = function() {
    this.dict = new Dictionary()
    this.sm = new TripleStorageManager()
    this.rules = OWL2RL.test
    this.queryHistory = []
    this.reasoning = true
    this.sm.init()
    this.computeRuleDependencies()
    this.log = []
}

Hylar.log = function(msg) {
    msg = new Date().toString() + ' ' + msg + '\n'
    this.log.push(msg)
    fs.appendFileSync(logFile, msg);
}

Hylar.prototype.lastLog = function() {
    this.log.length > 0 ? this.log[this.log.length-1] : ''
}

/**
 * Custom error display
 * @returns {*}
 */
Hylar.displayError = function(error) {
    let msg = error.stack || error.toString()
    console.log(`${chalk.red('[HyLAR] ')} 😰 ${chalk.bold('ERROR:')} ${msg}`);
    try {
        Hylar.log(msg)
    } catch (e) {
        return Errors.FileIO(logFile);
    }
};

/**
 * Custom warning display
 * @returns {*}
 */
Hylar.displayWarning = function(msg) {
    console.log(`${chalk.yellow('[HyLAR] ')} 😐 WARNING: ${msg}`);
    try {
        Hylar.log(msg)
    } catch (e) {
        return Errors.FileIO(logFile);
    }
}

/**
 * Notifications of HyLAR (similar to console.log behavior)
 * @returns {*}
 */
Hylar.notify = function(msg, params = { silent: false }) {
    if (params.silent == false) console.log(chalk.green('[HyLAR] ') + msg);
    try {
        Hylar.log(msg)
    } catch (e) {
        return Errors.FileIO(logFile);
    }
}

Hylar.success = function(msg) {
    console.log(`${chalkRainbow('[HyLAR] ')} 👍 ${msg}`);
    try {
        Hylar.log(msg)
    } catch (e) {
        return Errors.FileIO(logFile);
    }
}

Hylar.prototype.setReasoningOn = function() {
    this.reasoning = true
}

Hylar.prototype.setReasoningOff = function() {
    Hylar.displayWarning('Reasoning has been set off.')
    this.reasoning = false
}

Hylar.prototype.computeRuleDependencies = function() {
    Reasoner.updateRuleDependencies(this.rules);        
};      

Hylar.prototype.clean = function() {
    this.dict = new Dictionary();
    this.sm = new TripleStorageManager();
    this.sm.init();
};

/**
 * Puts on incremental reasoning
 */
Hylar.prototype.setIncremental = function() {
    this.rMethod = Reasoner.process.it.incrementally;
    this.dict.turnOffForgetting();
    Hylar.notify('Reasoner set as incremental.');
};

/**
 * Puts on tag-based reasoning
 */
Hylar.prototype.setTagBased = function() {
    this.rMethod = Reasoner.process.it.tagBased;
    this.dict.turnOnForgetting();
    Hylar.notify('Reasoner set as tag-based.');
};

Hylar.prototype.setRules = function(rules) {
    this.rules = rules;
};

/**
 * Switches HyLAR's reasoning method
 * @param method Name of the method ('incremental' or 'tagBased')
 */
Hylar.prototype.updateReasoningMethod = function(method = 'incremental') {
    if (!this.rMethod) {
        switch (method) {
            case 'tagBased':
                if (this.rMethod != Reasoner.process.it.tagBased) this.setTagBased()
                break;
            case 'incremental':
                if (this.rMethod != Reasoner.process.it.incrementally) this.setIncremental()
                break;
            default:
                Hylar.displayWarning(`Reasoning method ${method} not supported, using incremental instead.`)
                this.setIncremental()
        }
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
Hylar.prototype.load = async function(ontologyTxt, mimeType, keepOldValues, graph, reasoningMethod) {
    var that = this;
    emitter.emit('classif-started');
    this.updateReasoningMethod(reasoningMethod);

    if (!keepOldValues) {
        this.dict.clear();
        await this.sm.init()
        return that.treatLoad(ontologyTxt, mimeType, graph)
    } else {
        return this.treatLoad(ontologyTxt, mimeType, graph)
    }
};

Hylar.prototype.treatLoad = async function(ontologyTxt, mimeType) {
    var that = this;
    switch(mimeType) {
        case 'application/xml':
        case 'application/rdf+xml':
        case false:
            Hylar.error(`Unrecognized or unsupported mimeType. Supported formats are json-ld, turtle, n3`)
            return false;
            break;
        default:
            try {
                let r = await this.sm.load(ontologyTxt, mimeType)
                Hylar.notify(r + ' triples loaded in the store.')
                if (this.reasoning == true) {
                    return that.classify()
                } else {
                    return r
                }
            } catch (error) {
                Hylar.displayError(error)
                throw error;
            }
    }
};

/**
 * Launches a SPARQL query against the triplestore.
 * @param query The SPARQL query text
 * @param reasoningMethod The desired reasoning method if inserting/deleting
 */
Hylar.prototype.query = async function(query, reasoningMethod) {
    let sparql, singleWhereQueries = [], result
    Hylar.notify(`Received ${query}`, { silent: true })

    try {
        // Parse original query
		sparql = ParsingInterface.parseSPARQL(query)
        // Cleans out string query
        query = ParsingInterface.deserializeQuery(sparql)
	} catch (e) {
		Hylar.displayError('Problem with SPARQL query: ' + query);
		throw e;
	}

    if (this.reasoning == false) return this.sm.query(query)

    this.updateReasoningMethod(reasoningMethod);

    switch (sparql.type) {
        // Insert, delete queries
        case 'update':
            if (ParsingInterface.isUpdateWhere(sparql)) {
                // Get construct results of the update where query
                let sparqlConstruct = ParsingInterface.updateWhereToConstructWhere(sparql)
                let data = await this.query(ParsingInterface.deserializeQuery(sparqlConstruct))

                // Put them back in a simple update data manner to provide inner-graph inference
                return this.query(ParsingInterface.buildUpdateQueryWithConstructResults(sparql, data));
            } else {
                return this.treatUpdateWithGraph(query);
            }
            break;

        // Select, Ask, Construct queries
        default:
            // If incremental query
            if (this.rMethod == Reasoner.process.it.incrementally) {
                // To overcome rdfstore not supporting count; only supports count(*) though
                let countStatements = []

                if (sparql.hasOwnProperty('variables')) {
                    sparql.variables.forEach((_var, index) => {
                        if (_var.hasOwnProperty('expression') && _var.expression.aggregation == 'count') {
                            // If this is a count statement on a wildcard select, process it
                            if (_var.expression.expression == '*') {
                                countStatements.push(_var)
                                sparql.variables[index] = _var.expression.expression
                            // Otherwise throw unsupported
                            } else {
                                throw Errors.CountNotImplemented(_var.expression.expression)
                            }
                        }
                    })
                    if (countStatements.length > 0) query = ParsingInterface.deserializeQuery(sparql)
                }

                // Execute query against the store
                try {
                    results = await this.sm.query(query)
                } catch(err) {
                    throw err
                }

                // Reattach counted if relevant
                if (countStatements.length > 0) {
                    countStatements.forEach(cntStm => {
                        if (cntStm.expression.expression == '*') {
                            // The count result that will be attached
                            let countResult = {
                                token: 'literal',
                                type: 'http://www.w3.org/2001/XMLSchema#integer',
                                value: results.length
                            }

                            // Replace bindings
                            results.forEach((binding, index) => {
                                Object.keys(binding).forEach(_var => {
                                    if (sparql.variables.indexOf(_var) == -1) {
                                        delete binding[_var]
                                    }
                                })
                                if (Object.keys(binding).length == 0) {
                                    delete results[index]
                                }
                            })
                            results = results.filter(binding => binding)

                            // Either attach to remaining bindings or add a unique count binding
                            if (results.length > 0) {
                                results.forEach(binding => {
                                    binding[cntStm.variable] = countResult
                                })
                            } else {
                                let binding = {}
                                binding[cntStm.variable] = countResult
                                results.push(binding)
                            }
                        } else {
                            throw Errors.CountNotImplemented(cntStm.expression.expression)
                        }
                    })
                }

                return results

            // If tag-based query
            } else {
                await this.sm.regenerateSideStore()

                for (var i = 0; i < sparql.where.length; i++) {
                    singleWhereQueries.push(ParsingInterface.isolateWhereQuery(sparql, i))
                }

                await Promise.reduce(singleWhereQueries, function (previous, singleWhereQuery) {
                    return this.treatSelectOrConstruct(singleWhereQuery);
                }, 0)

                return this.sm.querySideStore(query);
            }
    }
};

/**
 * High-level treatUpdate that takes graphs into account.
 * @returns Promise
 */
Hylar.prototype.treatUpdateWithGraph = async function(query) {
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

    let values = await Promise.all(promises)
    return [].concat.apply([], values);

};

/**
 * Returns the content of the triplestore as turtle.
 * @returns {String}
 */
Hylar.prototype.getStorage = async function() {
    let content = await this.sm.getContent()
    return content.triples.toString();
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
Hylar.prototype.treatUpdate = async function(update, type) {
    var that = this,
        graph = update.name,
        iTriples = [],
        dTriples = [],
        FeIns, FeDel, F = this.getDictionary().values(graph),
        deleteQueryBody, promises = [],
        initialResponse = Utils.emptyPromise([ { triples:[] } ]);

    if(type == 'insert') {
        Hylar.notify('Starting insertion.');
        iTriples = iTriples.concat(update.triples);
    } else if(type  == 'delete') {
        Hylar.notify('Starting deletion.');
        for (var i = 0; i < update.triples.length; i++) {
            if (Utils.tripleContainsVariable(update.triples[i])) {
                deleteQueryBody = ParsingInterface.tripleToTurtle(update.triples[i]);
                promises.push(this.sm.query('CONSTRUCT { ' + deleteQueryBody + " }  WHERE { " + deleteQueryBody + " }"));
            } else {
                dTriples.push(update.triples[i]);
            }
        }

        initialResponse = Promise.all(promises);
        let results = await initialResponse

        for (var i = 0; i < results.length; i++) {
            dTriples = dTriples.concat(results[i].triples);
        }
    }

    FeIns = ParsingInterface.triplesToFacts(iTriples, true, (that.rMethod == Reasoner.process.it.incrementally));
    FeDel = ParsingInterface.triplesToFacts(dTriples, true, (that.rMethod == Reasoner.process.it.incrementally));

    let derivations = await Reasoner.evaluate(FeIns, FeDel, F, that.rMethod, that.rules)

    this.registerDerivations(derivations, graph);

    let updates = {
        insert: ParsingInterface.factsToTurtle(derivations.additions),
        delete: ParsingInterface.factsToTurtle(derivations.deletions)
    }

    if(updates.delete != '') return this.sm.delete(updates.delete, graph)
    if(updates.insert != '') return this.sm.insert(updates.insert, graph)
    return true
}


/**
 * Processes select or construct queries.
 * @param query The query text.
 * @returns {Object} The results of this query.
 */
Hylar.prototype.treatSelectOrConstruct = function(query) {
    if (this.rMethod == Reasoner.process.it.tagBased) {
        let parsedQuery= ParsingInterface.parseSPARQL(query),
            graph = parsedQuery.where[0].name,
            constructEquivalentQuery = ParsingInterface.constructEquivalentQuery(query, graph);

        let results = this.sm.query(constructEquivalentQuery)
        let triples = results.triples;
        let val = this.dict.findValues(triples, graph);
        let facts = val.found;

        let formattedResults = {
            results: results,
            filtered: Reasoner.engine.tagFilter(facts, that.dict.values(graph))
        }

        let temporaryData = this.dict.findKeys(formattedResults.filtered, graph).found.join(' ');
        return this.sm.loadIntoSideStore(temporaryData, graph);
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
    let factsToBeAdded = derivations.additions,
        factsToBeDeleted = derivations.deletions;
    graph = this.dict.resolveGraph(graph);
    Hylar.notify('Registering derivations to dictionary...');

    for (let i = 0; i < factsToBeDeleted.length; i++) {
        if (factsToBeDeleted[i].toString() == 'IFALSE') {
            delete this.dict.dict[graph]['__FALSE__'];
        } else {
            delete this.dict.dict[graph][ParsingInterface.factToTurtle(factsToBeDeleted[i])];
        }
    }

    for (var i = 0; i < factsToBeAdded.length; i++) {
        this.dict.put(factsToBeAdded[i], graph);
    }

    Hylar.success('Registered successfully.');
};

/**
 * Classifies the ontology
 * already loaded in the triplestore.
 * @returns {*}
 */
Hylar.prototype.classify = async function() {
    Hylar.notify('Classification started.');
    
    let r = await this.sm.query('CONSTRUCT { ?a ?b ?c } WHERE { ?a ?b ?c }')
    let facts = []

    for (let i = 0; i <  r.triples.length; i++) {
        let triple = r.triples[i];
            let _fs = this.dict.get(triple);
            if(!_fs) {
                let f = ParsingInterface.tripleToFact(triple, true, (this.rMethod == Reasoner.process.it.incrementally))
                this.dict.put(f)
                facts.push(f)
            } else facts = facts.concat(_fs)
    }

    let derivations = await Reasoner.evaluate(facts, [], [], this.rMethod, this.rules)
    this.registerDerivations(derivations);

    let chunks = [], chunksNb = 5000

    for (var i = 0, j = derivations.additions.length; i < j; i += chunksNb) {
        let factsChunk = derivations.additions.slice(i,i+chunksNb);
        chunks.push(ParsingInterface.factsToTurtle(factsChunk));
    }

    Hylar.notify('Classification succeeded.');
            
    await Promise.reduce(chunks, (previous, chunk) => {
        return this.sm.insert(chunk);
    }, 0)

    emitter.emit('classif-ended');
    return true
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
        Hylar.displayError('Error when parsing rule ' + rule);
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
            Hylar.notify("Removed rule " + this.rules[i].toString());
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
        Hylar.displayError('Error when parsing rule ' + raw);
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
        Hylar.displayError('Error when parsing rule ' + raw);
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
            Hylar.notify("Removed rule " + this.rules[i].toString());
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
    Hylar.notify = function(){};
};

module.exports = Hylar;

/**
 * Created by MT on 01/12/2015.
 */

 import fs from 'fs';
 import chalk from 'chalk';
 import chalkRainbow from 'chalk-rainbow';
 import Promise from 'bluebird';
 import emitter from './core/Emitter';
 import Dictionary from './core/Dictionary';
 import ParsingInterface from './core/ParsingInterface';
 import TripleStorageManager from './core/TripleStorageManager';
 import Logics from './core/Logics/Logics';
 import Reasoner from './core/Reasoner';
 import Rules from './core/Rules';
 import Utils from './core/Utils';
 import Errors from './core/Errors';
 import RegularExpressions from './core/RegularExpressions';
 import Prefixes from './core/Prefixes';
 import Axioms from './core/Axioms';


import Rule from './core/Logics/Rule';
 
 const additionalRules = (() => {
    const rules = Logics.parseRules([


        // `ls-mbr1 = (?l http://www.w3.org/1999/02/22-rdf-syntax-ns#first ?m) -> (?l http://rdf.equinor.com/ui/adhoc#hasMember ?m)`,
        // `ls-mbr2 = (?l2 http://rdf.equinor.com/ui/adhoc#hasMember ?m) ^ (?l1 http://www.w3.org/1999/02/22-rdf-syntax-ns#rest ?l2) -> (?l1 http://rdf.equinor.com/ui/adhoc#hasMember ?m)`,
        // `scm-uni = (?c http://www.w3.org/2002/07/owl#unionOf ?x) ^ (?x http://rdf.equinor.com/ui/adhoc#hasMember ?scmunimem) -> (?scmunimem http://www.w3.org/2002/07/owl#subClassOf ?c)`,
        // `cls-uni = (?x http://rdf.equinor.com/ui/adhoc#hasMember ?clsunimem) ^ (?c http://www.w3.org/2002/07/owl#unionOf ?x) ^ (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?clsunimem) -> (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c)`,

        // `cls-int1 = (?c http://www.w3.org/2002/07/owl#intersectionOf ?x1) ^ (?x1 http://www.w3.org/1999/02/22-rdf-syntax-ns#first ?c1) ^ (?x1 http://www.w3.org/1999/02/22-rdf-syntax-ns#rest ?x2) ^ (?x2 http://www.w3.org/1999/02/22-rdf-syntax-ns#first ?c2) ^ (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c1) ^ (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c2) -> (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c)`,

        // `cls-int2 = (?c http://www.w3.org/2002/07/owl#intersectionOf ?x) ^ (?x http://rdf.equinor.com/ui/adhoc#hasMember ?cn) ^ (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c) -> (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?cn)`,


        // `scm-int = (?c http://www.w3.org/2002/07/owl#intersectionOf ?x) ^ (?x http://rdf.equinor.com/ui/adhoc#hasMember ?cn) -> (?cn http://www.w3.org/2002/07/owl#subClassOf ?c)`,
        
        `cls-nv = (?x http://rdf.equinor.com/ontology/owl2ext#notValue ?y) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?u ?p ?nv) ^ (?nv != ?y) -> (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x)`,
        `cls-prpdiff = (?x http://rdf.equinor.com/ontology/owl2ext#multipleValuesOnProperty ?p) ^ (?u ?p ?v1) ^ (?u ?p ?v2) ^ (?v1 != ?v2) -> (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x)`
        // `scm-nv = (?c1 http://rdf.equinor.com/ui/adhoc#notValue ?i) ^ (?c1 http://www.w3.org/2002/07/owl#onProperty ?p1) ^ (?c2 http://rdf.equinor.com/ui/adhoc#notValue ?i) ^ (?c2 http://www.w3.org/2002/07/owl#onProperty ?p2) ^ (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) -> (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2)`

    ], Rule.types.OWL2RL);
    // const ruleDict = Object.assign({}, ...rules.map((x:any) => ({[x.name]: x })));
    // ruleDict['ls-mbr1 '].addDependentRule(ruleDict['ls-mbr2 ']);
    // ruleDict['ls-mbr1 '].addDependentRule(ruleDict['scm-uni ']);
    // ruleDict['ls-mbr1 '].addDependentRule(ruleDict['cls-uni ']);
    // ruleDict['ls-mbr2 '].addDependentRule(ruleDict['cls-uni ']);
    // ruleDict['ls-mbr2 '].addDependentRule(ruleDict['scm-uni ']);
    return rules;

})();
 
 const logFile = 'hylar.log';
 
 /**
  * HyLAR main module.
  * @author Mehdi Terdjimi
  * @organization LIRIS, Universite Lyon 1
  * @email mehdi.terdjimi@univ-lyon1.fr
  */
 class Hylar {
     constructor(params = {entailment: Rule.types.OWL2RL}) {
         this.dict = new Dictionary()
         this._customRules = []
         this.prefixes = new Prefixes();
         this.sm = new TripleStorageManager(this.prefixes)
         this.sm.init()
 
         this.reasoning = true
 
         this._setEntailment(params.entailment)
         this._setupPersistence(params.persistent)
 
         this.queryHistory = []
         this.log = []
 
         Hylar.currentInstance = this
     }
 
     static log(msg) {
         let dateMsg = `[ ${new Date().toString()} ] ${msg}\n`
         Hylar.currentInstance.log.push(msg)
         fs.appendFileSync(logFile, dateMsg);
     }
 
     /**
      * Rule set getter.
      * Depends on the specified entailment
      * @return {*}
      */
     get rules() {
         return this._customRules.concat(Rules[this.entailment])
     }
 
     /**
      * Entailment-related axioms
      */
     get axioms() {
         return Axioms.getAxioms(this.entailment)
     }
 
     get reasoningMethod() {
         switch(this.rMethod) {
             case Reasoner.process.it.incrementally:
                 return 'incremental'
                 break
             case Reasoner.process.it.tagBased:
                 return 'tagBased'
                 break
             default:
                 return 'none'
         }
     }
 
     /**
      * Sets up specified entailement,
      * then put axioms and compute rule dependencies
      * to optimize reasoning task time performance
      * @param entailment
      * @return {Promise<void>}
      * @private
      */
     async _setEntailment(entailment) {
         this.entailment = entailment != null ? entailment : 'owl2rl'
         Reasoner.updateRuleDependencies(this.rules);
     }
 
     /**
      * Process persistence task if specified
      * @param persistent
      * @private
      */
     async _setupPersistence(persistent) {
         if (persistent != null && persistent == true) {
             this.allowPersist = true
             this.restore()
         } else {
             this.allowPersist = false
         }
     }
 
     lastLog() {
         return this.log.length > 0 ? this.log[this.log.length-1] : ''
     }

    async setOwl2RL() {
        await this.addRules([/*...Rules.owl2rl,*/ ...additionalRules]);
    }

    async parseAndAddRules(rawRules, entailment = this.entailment) {
        try {
            const rules = Logics.parseRules(rawRules, entailment, this.prefixes);
            await this.addRules(rules)
        } catch (e) {
            Hylar.displayError(e);
            return;
        }
    }
 
     /**
      * Custom error display
      * @returns {*}
      */
     static displayError(error) {
         let msg = error.stack || error.toString()
         console.log(`${chalk.red('[HyLAR] ')} 😰 ${chalk.bold('ERROR:')} ${msg}`);
         try {
             Hylar.log(msg)
         } catch (e) {
             return Errors.FileIO(logFile);
         }
     }
 
     /**
      * Custom warning display
      * @returns {*}
      */
     static displayWarning(msg) {
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
     static notify(msg, params = { silent: false }) {
         if (params.silent == false) console.log(chalk.green('[HyLAR] ') + msg);
         try {
             Hylar.log(msg)
         } catch (e) {
             return Errors.FileIO(logFile);
         }
     }
 
     static success(msg) {
         console.log(`${chalkRainbow('[HyLAR] ')} ✨ ${msg}`);
         try {
             Hylar.log(msg)
         } catch (e) {
             return Errors.FileIO(logFile);
         }
     }
 
     async setReasoningOn() {
         this.reasoning = true
         await this.recomputeClosure()
     }
 
     async setReasoningOff() {
         Hylar.displayWarning('Reasoning has been set off.')
         this.reasoning = false
         await this.recomputeClosure()
     }
 
    async clean() {
        this.dict = new Dictionary();
        this.sm = new TripleStorageManager(this.prefixes);
        await this.sm.init();
        this.persist();
    }
 
     /**
      * Puts on incremental reasoning
      */
     async setIncremental() {
         this.rMethod = Reasoner.process.it.incrementally;
         this.dict.turnOffForgetting();
         Hylar.notify('Reasoner set as incremental.');
     }
 
     /**
      * Puts on tag-based reasoning
      */
     async setTagBased() {
         this.rMethod = Reasoner.process.it.tagBased;
         this.dict.turnOnForgetting();
         Hylar.notify('Reasoner set as tag-based.');
     }
 
     async setRules(rules) {
         this.rules = rules;
         await this.recomputeClosure()
     }
 
     /**
      * Switches HyLAR's reasoning method
      * @param method Name of the method ('incremental' or 'tagBased')
      */
     updateReasoningMethod(method = 'incremental') {
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
     }
 
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
     async load(ontologyTxt, mimeType, keepOldValues = false, graph= '#default') {
         emitter.emit('classif-started');
 
         if (!keepOldValues) {
             this.dict.clear();
             await this.sm.init()
             return this.treatLoad(ontologyTxt, mimeType, graph)
         } else {
             return this.treatLoad(ontologyTxt, mimeType, graph)
         }
     }
 
     async treatLoad(ontologyTxt, mimeType, graph) {
         switch(mimeType) {
             case 'application/xml':
             case 'application/rdf+xml':
             case false:
                 Hylar.displayError(`Unrecognized or unsupported mimeType. Supported formats are json-ld, turtle, n3`)
                 return false;
                 break;
             default:
                 try {
                     let r = await this.sm.load(ontologyTxt, mimeType)
                     Hylar.notify(r + ' triples loaded in the store.', {  })
                     if (this.reasoning == true) {
                         return this.classify(graph)
                     } else {
                         return r
                     }
                 } catch (error) {
                     Hylar.displayError(error)
                     throw error;
                 }
         }
     }
 
     /**
      * Launches a SPARQL query against the triplestore.
      * @param query The SPARQL query text
      * @param reasoningMethod The desired reasoning method if inserting/deleting
      */
     async query(query, reasoningMethod = 'incremental') {
         let sparql, singleWhereQueries = [], result
         Hylar.notify(`Received ${query}`, { silent: true })
 
         try {
             // Parse original query
             sparql = ParsingInterface.parseSPARQL(query)
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
                     }
 
                     // Execute query against the store
                     let results = []
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
 
                     await Promise.reduce(singleWhereQueries, (previous, singleWhereQuery) => {
                         return this.treatSelectOrConstruct(singleWhereQuery);
                     }, 0)
 
                     let results = await this.sm.querySideStore(query);
 
                     return results
                 }
         }
     }
 
     /**
      * High-level treatUpdate that takes graphs into account.
      * @returns Promise
      */
     async treatUpdateWithGraph(query) {
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
 
     }
 
     /**
      * Returns the content of the triplestore as turtle.
      * @returns {String}
      */
     async getStorage() {
         let content = await this.sm.getContent()
         return content.triples.toString();
     }
 
     /**
      * Empties and recreate the triplestore with elements
      * indicated in turtle/n3.
      * @param ttl The turtle/n3 triples to be added.
      * @returns {*}
      */
     setStorage(ttl) {
         return this.sm.createStoreWith(ttl);
     }
 
     getRulesAsStringArray() {
         var strRules = [];
         for (var i = 0; i < this.rules.length; i++) {
             strRules.push({ name: this.rules[i].name, rule: this.rules[i].toString(), type: this.rules[i].type } );
         }
         return strRules;
     }
 
     /**
      * Returns the dictionary content.
      * @returns {Object}
      */
     getDictionary() {
         return this.dict;
     }
 
     /**
      * Empties and recreate the content of the dictionary.
      * @param dict The content of the dictionary.
      */
     setDictionaryContent(dict) {
         this.dict.setContent(dict);
         this.persist()
     }
 
     importData(dictionary) {
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
         return this.sm.load(importedTriples, "text/turtle")
     }
 
     persist() {
         if (!this.allowPersist && fs) return
 
         // Check if db folder exists
         if (!fs.existsSync('./db')){
             fs.mkdirSync('./db')
         }
 
         let dbconf = {
             mappingsGraphDbFiles: {},
             customRules: []
         }
 
         if (fs.existsSync('./db/db.conf')) {
             dbconf = Object.assign(dbconf, JSON.parse(fs.readFileSync('./db/db.conf').toString()))
         }
 
         dbconf.customRules = this._customRules.map((r => { return { name: r.name, content: r.toString() } }))
 
         for (let graphUri in this.getDictionary().dict) {
             // Write db content on file
             let filename = `${graphUri.match(RegularExpressions.URI_AFTER_HASH_OR_SLASH)[0]}.n3`
             let dbfilename = `./db/${filename}`
             let graphContent = this.getDictionary().dict[graphUri]
             let explicitEntries = []
 
             for (let triple in graphContent) {
                 if (Logics.getOnlyExplicitFacts(graphContent[triple]).length > 0) explicitEntries.push(triple)
             }
             fs.writeFileSync(dbfilename, explicitEntries.join('\n'))
 
             dbconf.mappingsGraphDbFiles[filename] = graphUri
         }
 
         fs.writeFileSync('./db/db.conf', JSON.stringify(dbconf, null, 3))
     }
 
     async restore() {
         if (!fs || !fs.existsSync('./db') || !this.allowPersist) return
 
         Hylar.notify('... Recovering DB ...')
 
         let files  = fs.readdirSync('./db')
         let dbconf = {
             mappingsGraphDbFiles: {},
             customRules: []
         }
 
         if (fs.existsSync('./db/db.conf')) {
             dbconf = Object.assign(dbconf, JSON.parse(fs.readFileSync('./db/db.conf').toString()))
         }
 
         for (let file of files.filter((file) => { return file != 'db.conf'})) {
             try {
                 let content = fs.readFileSync(`./db/${file}`).toString()
                 for (let rule of dbconf.customRules) {
                     this._customRules.push(Logics.parseRule(rule.content, rule.name, this.entailment, this.prefixes))
                 }
                 await this.load(content, 'text/n3', true, dbconf.mappingsGraphDbFiles[file])
             } catch (err) {
                 Hylar.displayWarning(Errors.DBParsing(file))
             }
         }
 
         Hylar.notify('* DB recover finished *')
     }
 
     checkConsistency() {
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
     }
 
     isTagBased() {
         return (this.rMethod == Reasoner.process.it.tagBased);
     }
 
     isIncremental() {
         return (this.rMethod == Reasoner.process.it.incrementally);
     }
 
     /**
      * Processes update queries.
      * @param sparql The query text.
      * @returns {Object} The results of this query.
      */
     async treatUpdate(update, type) {
         let graph = update.name,
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
 
         FeIns = ParsingInterface.triplesToFacts(iTriples, true, (this.rMethod == Reasoner.process.it.incrementally));
         FeDel = ParsingInterface.triplesToFacts(dTriples, true, (this.rMethod == Reasoner.process.it.incrementally));
 
         try{
             let derivations = await Reasoner.evaluate(FeIns, FeDel, F.concat(this.axioms), this.rMethod, this.rules,);
             this.registerDerivations(derivations, graph);
 
             let updates = {
                 insert: ParsingInterface.factsToTurtle(derivations.additions),
                 delete: ParsingInterface.factsToTurtle(derivations.deletions)
             }
     
             if(updates.delete != '') return this.sm.delete(updates.delete, graph)
             if(updates.insert != '') return this.sm.insert(updates.insert, graph)
             return true
         }
         catch(e){
             Hylar.displayError(e);
             return false;
         }
 
 
     }
 
 
     /**
      * Processes select or construct queries.
      * @param query The query text.
      * @returns {Object} The results of this query.
      */
     async treatSelectOrConstruct(query) {
         if (this.rMethod == Reasoner.process.it.tagBased) {
             let parsedQuery= ParsingInterface.parseSPARQL(query),
                 graph = parsedQuery.where[0].name,
                 constructEquivalentQuery = ParsingInterface.constructEquivalentQuery(query, graph);
 
             let results = await this.sm.query(constructEquivalentQuery)
             let triples = results.triples;
             let val = this.dict.findValues(triples, graph);
             let facts = val.found;
 
             let formattedResults = {
                 results: results,
                 filtered: Reasoner.engine.tagFilter(facts, this.dict.values(graph))
             }
 
             let temporaryData = this.dict.findKeys(formattedResults.filtered, graph).found.join(' ');
             return this.sm.loadIntoSideStore(temporaryData, graph);
         } else {
             return this.sm.query(query);
         }
     }
 
     /**
      * Registers newly inferred derivations
      * in the Dictionary.
      * @param derivations The derivations to be registered.
      */
     registerDerivations(derivations, graph) {
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
             //Prefixes.registerPrefixFrom(factsToBeAdded[i])
         }
 
         this.persist()
         Hylar.success('Registered successfully.');
     }
 
     /**
      * Classifies the ontology
      * already loaded in the triplestore.
      * @returns {*}
      */
     async classify(graph) {
 
         Hylar.notify('Classification started.');
 
         let r = await this.sm.query('CONSTRUCT { ?a ?b ?c } WHERE { ?a ?b ?c }')
         let facts = []
 
         for (let i = 0; i <  r.triples.length; i++) {
             let triple = r.triples[i];
             let _fs = this.dict.get(triple);
             if(!_fs) {
                 let f = ParsingInterface.tripleToFact(triple, true, (this.rMethod == Reasoner.process.it.incrementally))
                 this.dict.put(f, graph)
                 facts.push(f)
             } else facts = facts.concat(_fs)
         }
         let success = true;
         try{
             let derivations = await Reasoner.evaluate(facts, [], this.axioms, this.rMethod, this.rules)
 
             this.registerDerivations(derivations, graph);
             
             let chunks = [], chunksNb = 5000
             
             for (var i = 0, j = derivations.additions.length; i < j; i += chunksNb) {
                 let factsChunk = derivations.additions.slice(i,i+chunksNb);
                 chunks.push(ParsingInterface.factsToTurtle(factsChunk));
             }
             
             Hylar.notify('Classification succeeded.');
             
             await Promise.reduce(chunks, (previous, chunk) => {
                 return this.sm.insert(chunk);
             }, 0);
             
         } catch(e) {
             Hylar.displayError(e);
             succ = false;
         }
 
         emitter.emit('classif-ended');
         return success;
     }
 
     async recomputeClosure() {
         let fullExplicitGraphs = this.dict.explicitGraphs()
         await this.clean()
 
         for (let graph of fullExplicitGraphs) {
             await this.load(graph.content, 'text/turtle', true, graph.name)
         }
     }
 
     /**
      * Add rules to the reasoner for
      * the next inferences.
      * @param ruleSet
      */
     async addRules(ruleSet) {
         this._customRules.push(...ruleSet)
         await this.recomputeClosure()
     }
 
     async addRule(rule) {
         this._customRules.push(rule)
         await this.recomputeClosure()
     }
 
     async parseAndAddRule(rawRule, name) {
         var rule;
         try {
             rule = Logics.parseRule(rawRule, name, this.entailment, this.prefixes);
         } catch(e) {
             Hylar.displayError('Error when parsing rule ' + rule);
             return;
         }
         await this.addRule(rule)
     }
 
     async removeRuleByName(name) {
         this._customRules = this._customRules.filter((rule) => {
             return rule.name != name
         })
         await this.recomputeClosure()
     }
 
     addToQueryHistory(query, noError) {
         this.queryHistory.push({ query: query, noError: noError });
     }
 
     async resetRules() {
         this._customRules = [];
         await this.recomputeClosure()
     }
 
     quiet() {
         Hylar.notify = function(){};
     }
 }
 
 
 export default Hylar;
 // module.exports = Hylar;
 
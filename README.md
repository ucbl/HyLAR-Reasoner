# HyLAR-Reasoner #

HyLAR-Reasoner is an OWL 2 RL reasoner that uses JSW and OWLReasoner (https://code.google.com/p/owlreasoner/) as a triplestore and provides an additional incremental reasoning engine. The framework implementation of HyLAR is available at https://github.com/ucbl/HyLAR.

## Getting started ##

### Install HyLAR's reasoner module ###

`npm install --save hylar`

### Classify your ontology and query it ###

(currently accepts OWL 2 XML serialization only)

```
var Hylar = require('hylar');
var classifiedOntology, queryResults;

classifiedOntology = Hylar.classify('./fipa.owl'));

queryResults = Hylar.query('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
                            'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ' +
                            'SELECT ?a ?b { ?a rdfs:subClassOf ?b }');
```

# HyLAR-Reasoner #

OWL 2 RL incremental reasoner

## Description ###

HyLAR-Reasoner is an OWL 2 RL reasoner that uses JSW and OWLReasoner as a triplestore and provides an additional incremental reasoning engine.
The framework implementation of HyLAR can be tested online at [[http://dataconf.liris.cnrs.fr/hylar/]]

### Supported OWL constructs and inferences ###

Our reasoner currently supports partial OWL2-RL semantics (ObjectSomeValuesFrom, DataSomeValuesFrom, InverseObjectProperties, ObjectPropertyRange, ObjectPropertyDomain and DataPropertyRange).
It also provides inferences on Class and Object Properties subsumption and equivalence (owl:subClassOf, owl:subPropertyOf, owl:equivalentClasses).

## Getting started ##

### Use HyLAR's reasoner module locally ###

1) Install locally

`npm install --save hylar`

2) Import HyLAR, then classify your ontology and query it

(currently accepts OWL 2 XML serialization only)

```
var Hylar = require('hylar');
var classifiedOntology, queryResults;

classifiedOntology = Hylar.classify('./fipa.owl'));

queryResults = Hylar.query('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
                            'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ' +
                            'SELECT ?a ?b { ?a rdfs:subClassOf ?b }');
```

### Use HyLAR as a server ###

1) Install HyLAR globally:
`npm install -g hylar`

2) Use CLI to run HyLAR as a server:
`hylar --port 3000 -od /usr/local/share/ontologies/`

`--port <port_number>` or `-p <port_number>` is optional. HyLAR runs at port 3000 by default.

`--ontology-directory </your/base/ontology/directory/>` or `-od </your/base/ontology/directory/>` is also optional.
This parameter specifies the directory in which ontologies are located, in order to classify them. By default, HyLAR uses its module path, i.e. `{path_to_hylar}/server/ontologies/`.

It then outputs:
```
[HyLAR] Setting up routes...
[HyLAR] Done.
[HyLAR] Exposing server to port 3000...
[HyLAR] Done.
[HyLAR] HyLAR is running.
```

3) Once HyLAR is launched, it can be requested as follows:

(GET) `/classify`
> Parameters
`filename` (the absolute path of the ontology file to be processed)
Parses and classify an ontology (OWL 2 XML serialization). Supports Classes, ObjectProperties and DatatypeProperties. This step has to be done before sending any SPARQL query (but only once, as the reasoner instance is kept in-memory).

(GET) `/query`
> Parameters
`query` (the SPARQL query string)
Being a GET request parameter, the query must be urlencoded accordingly.
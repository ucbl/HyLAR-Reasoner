# HyLAR-Reasoner #

An OWL 2 RL incremental reasoner for the Web.

## Description ###

HyLAR-Reasoner is an OWL 2 RL reasoner that uses JSW and OWLReasoner as a triplestore and provides an additional incremental reasoning engine.
The framework implementation of HyLAR can be tested online at http://dataconf.liris.cnrs.fr/hylar/

### Supported OWL constructs and inferences ###

HyLAR currently supports partial OWL 2 constructs (ObjectSomeValuesFrom, DataSomeValuesFrom, InverseObjectProperties, ObjectPropertyRange, ObjectPropertyDomain and DataPropertyRange).
It also provides the following inferences, based on the semantics presented in https://www.w3.org/TR/owl2-profiles/#Reasoning_in_OWL_2_RL_and_RDF_Graphs_using_Rules :

`(?c1, http://www.w3.org/2000/01/rdf-schema#subClassOf, ?c2) ^ (?c2, http://www.w3.org/2000/01/rdf-schema#subClassOf, ?c3) -> (?c1, http://www.w3.org/2000/01/rdf-schema#subClassOf, ?c3)`

`(?c1, http://www.w3.org/2000/01/rdf-schema#subClassOf, ?c2) ^ (?x, http://www.w3.org/1999/02/22-rdf-syntax-ns#type, ?c1) -> (?x, http://www.w3.org/1999/02/22-rdf-syntax-ns#type, ?c2)`

`(?p1, http://www.w3.org/2000/01/rdf-schema#subPropertyOf, ?p2) ^ (?p2, http://www.w3.org/2000/01/rdf-schema#subPropertyOf, ?p3) -> (?p1, http://www.w3.org/2000/01/rdf-schema#subClassOf, ?p3)`

`(?p1, http://www.w3.org/2000/01/rdf-schema#subPropertyOf, ?p2) ^ (?x, ?p1, ?y) -> (?x, ?p2, ?y)`

`(?x, ?p, ?y) ^ (?p, http://www.w3.org/1999/02/22-rdf-syntax-ns#type, http://www.w3.org/2002/07/owl#TransitiveProperty) ^ (?y, ?p, ?z) -> (?x, ?p, ?z)`

`(?p1, http://www.w3.org/2002/07/owl#inverseOf, ?p2) ^ (?x, ?p1, ?y) -> (?y, ?p2, ?x)`

`(?p1, http://www.w3.org/2002/07/owl#inverseOf, ?p2) ^ (?x, ?p2, ?y) -> (?y, ?p1, ?x)`

`(?c1, http://www.w3.org/2002/07/owl#equivalentClass, ?c2) ^ (?x, http://www.w3.org/1999/02/22-rdf-syntax-ns#type, ?c1) -> (?x, http://www.w3.org/1999/02/22-rdf-syntax-ns#type, ?c2)`

`(?c1, http://www.w3.org/2002/07/owl#equivalentClass, ?c2) ^ (?x, http://www.w3.org/1999/02/22-rdf-syntax-ns#type, ?c2) -> (?x, http://www.w3.org/1999/02/22-rdf-syntax-ns#type, ?c1)`

`(?p1, http://www.w3.org/2002/07/owl#equivalentProperty, ?p2) ^ (?x, ?p1, y) -> (?x, ?p2, ?y)`

`(?p1, http://www.w3.org/2002/07/owl#equivalentProperty, ?p2) ^ (?x, ?p2, y) -> (?x, ?p1, ?y)`

`(?s1, http://www.w3.org/2002/07/owl#sameAs, ?s2) ^ (?s1, ?p, ?o) -> (?s2, ?p, ?o)`

`(?p1, http://www.w3.org/2002/07/owl#sameAs, ?p2) ^ (?s, ?p1, ?o) -> (?s, ?p2, ?o)`

`(?o1, http://www.w3.org/2002/07/owl#sameAs, ?o2) ^ (?s, ?p, ?o1) -> (?s, ?p, ?o2)`

`(?x, http://www.w3.org/2002/07/owl#sameAs, ?y) ^ (?y, http://www.w3.org/2002/07/owl#sameAs, ?z) -> (?x, http://www.w3.org/2002/07/owl#sameAs, ?z)`

This list of rules can be restricted by editing the file `(root)/hylar/core/OWL2RL.js`.
At classification time, inferences are performed in the default graph.

## Getting started ##

### Use HyLAR's reasoner module locally ###

#### I. Install locally ####

`npm install --save hylar`

#### II. Import HyLAR, then classify your ontology and query it ####

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

#### I. Install HyLAR globally ####

`npm install -g hylar`

#### II. Use CLI to run HyLAR as a server ####

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

#### III. Request HyLAR as follows ####

(GET) `/classify`
> Parameters
`filename` (the absolute path of the ontology file to be processed)
Parses and classify an ontology (OWL 2 XML serialization). Supports Classes, ObjectProperties and DatatypeProperties. This step has to be done before sending any SPARQL query (but only once, as the reasoner instance is kept in-memory).

(GET) `/query`
> Parameters
`query` (the SPARQL query string)
Being a GET request parameter, the query must be urlencoded accordingly.
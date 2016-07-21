# HyLAR-Reasoner

An OWL 2 RL incremental reasoner for the Web.

## Description

HyLAR-Reasoner is an OWL 2 RL reasoner that uses known rdf-based librairies such as rdfstore.js, sparqljs and rdf-ext while providing an additional incremental reasoning engine. The framework implementation of HyLAR can be [tested online](http://dataconf.liris.cnrs.fr/hylar/). HyLAR can be either use locally as any npm module, or globally as a server.

## Supported serializations, OWL constructs and inferences

HyLAR relies on the rdfstore.js triplestore as well as rdf-ext parsing librairies, and therefore supports JSON-LD, RDF/XML, N3 and Turtle serializations.
SPARQL support is detailed [here](https://github.com/antoniogarrote/rdfstore-js#sparql-support).

HyLAR also provides the following inferences, based on the semantics detailed [here](https://www.w3.org/TR/owl2-profiles/#Reasoning_in_OWL_2_RL_and_RDF_Graphs_using_Rules):

* `(?c1, http://www.w3.org/2000/01/rdf-schema#subClassOf, ?c2) ^ (?c2, http://www.w3.org/2000/01/rdf-schema#subClassOf, ?c3) -> (?c1, http://www.w3.org/2000/01/rdf-schema#subClassOf, ?c3)`

* `(?c1, http://www.w3.org/2000/01/rdf-schema#subClassOf, ?c2) ^ (?x, http://www.w3.org/1999/02/22-rdf-syntax-ns#type, ?c1) -> (?x, http://www.w3.org/1999/02/22-rdf-syntax-ns#type, ?c2)`

* `(?p1, http://www.w3.org/2000/01/rdf-schema#subPropertyOf, ?p2) ^ (?p2, http://www.w3.org/2000/01/rdf-schema#subPropertyOf, ?p3) -> (?p1, http://www.w3.org/2000/01/rdf-schema#subClassOf, ?p3)`

* `(?p1, http://www.w3.org/2000/01/rdf-schema#subPropertyOf, ?p2) ^ (?x, ?p1, ?y) -> (?x, ?p2, ?y)`

* `(?x, ?p, ?y) ^ (?p, http://www.w3.org/1999/02/22-rdf-syntax-ns#type, http://www.w3.org/2002/07/owl#TransitiveProperty) ^ (?y, ?p, ?z) -> (?x, ?p, ?z)`

* `(?p1, http://www.w3.org/2002/07/owl#inverseOf, ?p2) ^ (?x, ?p1, ?y) -> (?y, ?p2, ?x)`

* `(?p1, http://www.w3.org/2002/07/owl#inverseOf, ?p2) ^ (?x, ?p2, ?y) -> (?y, ?p1, ?x)`

* `(?c1, http://www.w3.org/2002/07/owl#equivalentClass, ?c2) ^ (?x, http://www.w3.org/1999/02/22-rdf-syntax-ns#type, ?c1) -> (?x, http://www.w3.org/1999/02/22-rdf-syntax-ns#type, ?c2)`

* `(?c1, http://www.w3.org/2002/07/owl#equivalentClass, ?c2) ^ (?x, http://www.w3.org/1999/02/22-rdf-syntax-ns#type, ?c2) -> (?x, http://www.w3.org/1999/02/22-rdf-syntax-ns#type, ?c1)`

* `(?p1, http://www.w3.org/2002/07/owl#equivalentProperty, ?p2) ^ (?x, ?p1, y) -> (?x, ?p2, ?y)`

* `(?p1, http://www.w3.org/2002/07/owl#equivalentProperty, ?p2) ^ (?x, ?p2, y) -> (?x, ?p1, ?y)`

* `(?s1, http://www.w3.org/2002/07/owl#sameAs, ?s2) ^ (?s1, ?p, ?o) -> (?s2, ?p, ?o)`

* `(?p1, http://www.w3.org/2002/07/owl#sameAs, ?p2) ^ (?s, ?p1, ?o) -> (?s, ?p2, ?o)`

* `(?o1, http://www.w3.org/2002/07/owl#sameAs, ?o2) ^ (?s, ?p, ?o1) -> (?s, ?p, ?o2)`

* `(?x, http://www.w3.org/2002/07/owl#sameAs, ?y) ^ (?y, http://www.w3.org/2002/07/owl#sameAs, ?z) -> (?x, http://www.w3.org/2002/07/owl#sameAs, ?z)`

## Use HyLAR's reasoner module locally

**Installation.**
To use HyLAR locally, just launch
`npm install --save hylar`

**Loading an ontology.**
Import HyLAR, then classify your ontology and query it using `load()`,
which takes three parameters:
- rawOntology: A string, the raw ontology.
- mimeType: A string, either `application/rdf+xml`, `text/turtle`, `text/n3` or `application/ld+json`.
- reasoningMethod: A string, either `tagBased` or `incremental` (if left blank at first initialization, it will automatically set to tag-based).

```javascript
var H = require('hylar'),
    Hylar = new H();
    
Hylar.load(rawOntology, mimeType, reasoningMethod)
    .then(function(reponse) {
        console.log(response) // outputs true if succeeded
    });
```

**Querying an ontology.**
Once loaded, HyLAR is able to process SPARQL queries using `query()`, with the following parameters:

- query: A string, the SPARQL query
- reasoningMethod: A string, either `tagBased` or `incremental` (if left blank, it will not change anything to the initial configuration).

```javascript
Hylar.query(query, reasoningMethod)
    .then(function(results) {
        console.log(results) // is a JSON object
    });
```

**Create your own rules.**
HyLAR supports insertion of custom forward-chaining conjunctive rules in the form:
```
triple_head_1 ^ ... ^ triple_head_n -> triple_body_3
```
Where `triple_head_x` and `triple_body_x` are respectively "cause" triples (*i.e.* the input) and "consequence" triples (*i.e.* the inferred output) in the form:
```
(subject predicate object)
```
Each subject/predicate/object can be one of the following:
- A variable, *e.g.* `?x`
- An URI, *e.g.* `http://www.w3.org/2000/01/rdf-schema#subClassOf`
- A literal, *e.g.* `"0.5"`, `"Hello world!"`

> **Note:** Comparison operators such as `<`, `>`, `=`, `<=`, `=>` are **not (yet) supported**.

## Use HyLAR as a server

**Installation.**
`npm install -g hylar`.

**Run the server.**
`hylar --port 3000 -od /usr/local/share/ontologies/`

> **Note:**  `--port <port_number>` or `-p <port_number>` is optional. HyLAR runs at port 3000 by default. 
> `--ontology-directory </your/base/ontology/directory/>` or `-od </your/base/ontology/directory/>` is also optional.
This parameter specifies the directory in which ontologies are located, in order to classify them. By default, HyLAR uses its module path, i.e. `{path_to_hylar}/server/ontologies/`.

**Load and query your ontology.**

***GET /classify***
Loads, parses and classify an ontology in the same way it is done with `Hylar.load()`. You don't have to specify the ontology file's mimetype however, as it is detected automatically.
> **Parameters:** `filename` (the absolute path of the ontology file to be processed)

***GET /query***
SPARQL queries your loaded ontology as does `Hylar.query()`.

> **Parameters:** `query` (the SPARQL query string)
Being a GET request parameter, the query must be urlencoded accordingly.

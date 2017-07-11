# HyLAR-Reasoner ![HyLAR icon](https://github.com/ucbl/HyLAR-Reasoner/blob/master/hylar-icon.png) 

A rule-based incremental reasoner for the Web.

![Build status on node 6, 5, 4](https://api.travis-ci.org/ucbl/HyLAR-Reasoner.svg?branch=master)

## Table of contents

- [Description](#description)
- [Use HyLAR locally](#use-hylar-locally)
- [Use HyLAR in a browser](#use-hylar-in-a-browser)
- [Use HyLAR as a server](#use-hylar-as-a-server)
- [Supported Inferences](#supported-inferences)

## Description

HyLAR is a **Hy**brid **L**ocation-**A**gnostic incremental **R**easoner that uses known rdf-based librairies such as rdfstore.js, sparqljs and rdf-ext while providing an additional incremental reasoning engine. HyLAR can be either used locally as a npm module or globally as a server, and comes with a browserified version.

HyLAR relies on the rdfstore.js triplestore as well as rdf-ext parsing librairies, and therefore supports JSON-LD, RDF/XML, N3 and Turtle serializations.
SPARQL support is detailed [here](https://github.com/antoniogarrote/rdfstore-js#sparql-support). The inferences initially supported by HyLAR are described [at the bottom of this page](#supported-inferences). HyLAR supports custom business rules.

## Use HyLAR locally

### Installation

To use HyLAR locally, just launch
`npm install --save hylar`

### Loading an ontology

Import HyLAR, then classify your ontology and query it using `load()`,
which takes three parameters:
- rawOntology: A string, the raw ontology.
- mimeType: A string, either `application/rdf+xml`, `text/turtle`, `text/n3` or `application/ld+json`.
- keepOldValues: A boolean: true to keep old values while classfying, false to overwrite the KB. Default is **false**.

```javascript
var Hylar = require('hylar'),
    h = new Hylar();
    
h.load(rawOntology, mimeType, keepOldValues)
    .then(function(reponse) {
        console.log(response) // outputs true if succeeded
    });
```

### Querying an ontology

Once loaded, HyLAR is able to process SPARQL queries using `query()`, with the following parameters:

- query: A string, the SPARQL query

```javascript
h.query(query)
    .then(function(results) {
        console.log(results) // is a JSON object
    });
```

### Create your own rules

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

A predicate can also be any of these comparison operators: `<`, `>`, `=`, `<=`, `=>`.

**Rule add example (first param: the 'raw' rule, second param: the rule name)**

```javascript
h.parseAndAddRule('(?p1 http://www.w3.org/2002/07/owl#inverseOf ?p2) ^ (?x ?p1 ?y) -> (?y ?p2 ?x)', 'inverse-1');
```
**Rule removal example (first and only param: either the rule name or the raw rule)**

```javascript
h.removeRule('inverse-1');
// Outputs "[HyLAR] Removed rule (?p1 inverseOf ?p2) ^ (?x ?p1 ?y) -> (?y ?p2 ?x)" if succeeded.
```

## Use HyLAR in a browser

HyLAR comes with a browserified version, available using bower: `bower install hylar`. Include the file `hylar-client.js` as a script in your page with this line:
```html
<script src="path-to/hylar-client.js"></script>
```
As in the node module version, you can instantiate HyLAR with `var h = new Hylar();` and call the same methods `query()`, `load()` and `parseAndAddRule()`.

## Use HyLAR as a server

### Installation

`npm install -g hylar`

### Run the server

`hylar --port 3000 -od /usr/local/share/ontologies/`

> **Note:**  `--port <port_number>` or `-p <port_number>` is optional. HyLAR runs at port 3000 by default. 
> 
> `--ontology-directory </your/base/ontology/directory/>` or `-od </your/base/ontology/directory/>` is also optional.
This parameter specifies the directory in which ontologies are located, in order to classify them. By default, HyLAR uses its module path, i.e. `{path_to_hylar}/server/ontologies/`.

### Load and query your ontology

#### GET /classify/{FILE_NAME}
Loads, parses and classify the file **{FILE_NAME}** from the ontology directory.
> **Note:** You don't have to specify the ontology file's mimetype as it is detected automatically using its extension.

#### GET /classify/
Allows classifying an ontology as a string, which requires its original serialization type.
> **Body parameters** 
>`filename` the absolute path of the ontology file to be processed.
> `mimetype` the serialization of the ontology (mimetype, one of application/rdf+xml, text/turtle, text/n3 or application/ld+json).

#### GET /query
SPARQL queries your loaded ontology as does `Hylar.query()`.

> **Body parameters**
> `query` the SPARQL query string.

#### PUT /rule
Puts an list of custom rules and adds it to the reasoner.

> **Body parameters**
> `rules` the array of conjunctive rules.

## Supported inferences

The following OWL 2 rules are currently supported by HyLAR, based on the semantics detailed [here](https://www.w3.org/TR/owl2-profiles/#Reasoning_in_OWL_2_RL_and_RDF_Graphs_using_Rules):

* `(?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2) ^ (?c2 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c3) -> (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c3)`

* `(?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2) ^ (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c1) -> (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c2)`

* `(?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) ^ (?p2 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p3) -> (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p3)`

* `(?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) ^ (?x ?p1 ?y) -> (?x ?p2 ?y)`

* `(?x ?p ?y) ^ (?p http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#TransitiveProperty) ^ (?y ?p ?z) -> (?x ?p ?z)`

* `(?p1 http://www.w3.org/2002/07/owl#inverseOf ?p2) ^ (?x ?p1 ?y) -> (?y ?p2 ?x)`

* `(?p1 http://www.w3.org/2002/07/owl#inverseOf ?p2) ^ (?x ?p2 ?y) -> (?y ?p1 ?x)`

* `(?c1 http://www.w3.org/2002/07/owl#equivalentClass ?c2) ^ (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c1) -> (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c2)`

* `(?c1 http://www.w3.org/2002/07/owl#equivalentClass ?c2) ^ (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c2) -> (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c1)`

* `(?p1 http://www.w3.org/2002/07/owl#equivalentProperty ?p2) ^ (?x ?p1 y) -> (?x ?p2 ?y)`

* `(?p1 http://www.w3.org/2002/07/owl#equivalentProperty ?p2) ^ (?x ?p2 y) -> (?x ?p1 ?y)`

* `(?s1 http://www.w3.org/2002/07/owl#sameAs ?s2) ^ (?s1 ?p ?o) -> (?s2 ?p ?o)`

* `(?p1 http://www.w3.org/2002/07/owl#sameAs ?p2) ^ (?s ?p1 ?o) -> (?s ?p2 ?o)`

* `(?o1 http://www.w3.org/2002/07/owl#sameAs ?o2) ^ (?s ?p ?o1) -> (?s ?p ?o2)`

* `(?x http://www.w3.org/2002/07/owl#sameAs ?y) ^ (?y http://www.w3.org/2002/07/owl#sameAs ?z) -> (?x http://www.w3.org/2002/07/owl#sameAs ?z)`

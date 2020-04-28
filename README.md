# HyLAR-Reasoner ![HyLAR icon](https://raw.githubusercontent.com/ucbl/HyLAR-Reasoner/master/hylar-icon.png) 

A rule-based incremental reasoner for the Web.

To cite HyLAR: [HyLAR+: improving Hybrid Location-Agnostic Reasoning
with Incremental Rule-based Update](https://hal.archives-ouvertes.fr/hal-01276558/file/Demo_www2016.pdf)

## Table of contents

- [Description](#description)
- [Use HyLAR locally](#use-hylar-locally)
- [Use HyLAR in a browser](#use-hylar-in-a-browser)
- [Use HyLAR as a server](#use-hylar-as-a-server)
- [Supported Inferences](#supported-inferences)
- [Publications](#publications)


## Description

HyLAR is a **Hy**brid **L**ocation-**A**gnostic incremental **R**easoner that uses known rdf-based librairies such as rdfstore.js, sparqljs and rdf-ext while providing an additional incremental reasoning engine. HyLAR can be either used locally as a npm module or globally as a server, and comes with a browserified version.

HyLAR relies on the rdfstore.js triplestore and therefore supports JSON-LD, N3 and Turtle serializations.
SPARQL support is detailed [here](https://github.com/antoniogarrote/rdfstore-js#sparql-support). The inferences initially supported by HyLAR are described [at the bottom of this page](#supported-inferences). HyLAR supports custom business rules.

## Use HyLAR locally

### Installation

To use HyLAR locally, just launch
`npm install --save hylar`

### Loading an ontology

Import HyLAR, then classify your ontology and query it using `load()`,
which takes three parameters:
- rawOntology: A string, the raw ontology.
- mimeType: A string, either `text/turtle`, `text/n3` or `application/ld+json`.
- keepOldValues: A boolean: true to keep old values while classfying, false to overwrite the KB. Default is **false**.

```javascript
const Hylar = require('hylar');
const h = new Hylar();
    
// async function
h.load(rawOntology, mimeType, keepOldValues);
```

### Querying an ontology

Once loaded, HyLAR is able to process SPARQL queries using `query()`, with the following parameters:

- query: A string, the SPARQL query

```javascript
let results = await h.query(query);
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

Run `npm run clientize`, which will generate the file `hylar-client.js`.
Include this script in your page with this line:
```html
<script src="path-to/hylar-client.js"></script>
```
As in the node module version, you can instantiate HyLAR with `const h = new Hylar();` and call the same methods `query()`, `load()` and `parseAndAddRule()`.

## Use HyLAR as a server

### Installation

`npm install -g hylar`

### Run the server

Command `hylar` with the following optional parameters

- `--port <port_number>` (port 3000 by default)
- `--no-persist` deactivates database persistence (activated by default)
- `--graph-directory </your/base/graph/directory/>` where local datasets are saved
- `--entailment` either ```OWL2RL``` (default) or ```RDFS```
- `--reasoning-method` either `incremental` (default) or `tag-based` (provides *reasoning proofs*)

### Hylar server API

- `/classify/{FILE_NAME}` (GET)

Loads, parses and classify the file `{FILE_NAME}` from the ontology directory.
> **Note:** You don't have to specify the ontology file's mimetype as it is detected automatically using its extension.

- `/classify/` (GET)

Allows classifying an ontology as a string, which requires its original serialization type.
> **Body parameters** 
>`filename` the absolute path of the ontology file to be processed.
> `mimetype` the serialization of the ontology (mimetype, one of text/turtle, text/n3 or application/ld+json).

- `/query`(GET)

SPARQL queries your loaded ontology as does `Hylar.query()`.

> **Body parameters**
> `query` the SPARQL query string.

- `/rule` (PUT)

Puts an list of custom rules and adds it to the reasoner.

> **Body parameters**
> `rules` the array of conjunctive rules.

## Supported inferences

HyLAR supports a subset of OWL 2 RL and RDFS.
- [RDFS](https://www.w3.org/TR/rdf-mt/#RDFSRules)
    - Rules:
`rdf1, rdfs2, rdfs3, rdfs4a, rdfs4b, rdfs5, dfs6, rdfs7, rdfs8, rdfs9, rdfs10, rdfs11, rdfs12, rdfs13`.
    - Supports all RDFS axiomatic triples, except axioms related to `rdf:Seq` and `rdf:Bag`.    
- [OWL 2 RL](https://www.w3.org/TR/owl2-profiles/#Reasoning_in_OWL_2_RL_and_RDF_Graphs_using_Rules)
    - Rules: `prp-dom, prp-rng, prp-fp, prp-ifp, prp-irp, prp-symp, prp-asyp, prp-trp, prp-spo1, prp-spo2, prp-eqp1, prp-eqp2, prp-pdw, prp-inv1, prp-inv2, prp-npa1, prp-npa2, cls-nothing2, cls-com, cls-svf1, cls-svf2, cls-avf, cls-hv1, cls-hv2, cls-maxc1, cls-maxc2, cls-maxqc1, cls-maxqc2, cls-maxqc3, cls-maxqc4, cax-sco, cax-eqc1, cax-eqc2, cax-dw, scm-cls, scm-sco, scm-eqc1, scm-eqc2, scm-op, scm-dp, scm-spo, scm-eqp1, scm-eqp2, scm-dom1, scm-dom2, scm-rng1, scm-rng2, scm-hv, scm-svf1, scm-svf2, scm-avf1, scm-avf2`
    - Axiomatic triples are *not yet* supported.

## Publications

### Location-agnostic mechanism

Terdjimi, M., Médini, L., & Mrissa, M. (2015, May). [Hylar: Hybrid location-agnostic reasoning 📚](https://hal.archives-ouvertes.fr/hal-01154549/file/hylar.pdf) In ESWC Developers Workshop 2015 (p. 1).

### Incremental reasoning on the Web with HyLAR

Terdjimi, M., Médini, L., & Mrissa, M. (2016, April). [HyLAR+: improving hybrid location-agnostic reasoning with incremental rule-based update 📚](https://hal.archives-ouvertes.fr/hal-01276558/file/Demo_www2016.pdf) In Proceedings of the 25th International Conference Companion on World Wide Web (pp. 259-262). International World Wide Web Conferences Steering Committee. 

### Tag-based maintenance

Terdjimi, M., Médini, L., & Mrissa, M. (2018, April). [Web Reasoning Using Fact Tagging 📚](http://mmrissa.perso.univ-pau.fr/pub/Accepted-papers/2018-TheWebConf-RoD.pdf) In Companion of the The Web Conference 2018 on The Web Conference 2018 (pp. 1587-1594). International World Wide Web Conferences Steering Committee.


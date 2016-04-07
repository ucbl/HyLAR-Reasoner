var Store = require('./src/store');

var frankie = 'http://test.com#francesca';

console.log(Store);

Store.create({name: 'test', overwrite: true}, function (err, store) {

    var graph = store.rdf.createGraph();
    var rdfEnv = store.rdf;


    graph.add(rdfEnv.createTriple(rdfEnv.createNamedNode(frankie),
                              rdfEnv.createNamedNode('foaf:mbox'),
                              rdfEnv.createNamedNode('mailto:mail1@example.com')));
    graph.add(rdfEnv.createTriple(rdfEnv.createNamedNode(frankie),
                              rdfEnv.createNamedNode('foaf:mbox'),
                              rdfEnv.createNamedNode('mailto:mail2@example.com')));


    store.insert(graph, function (err, results) {
        console.log("INSERTING: "+err+" :: "+results);

        store.execute('SELECT * { ?S ?P ?O }', function(err,results){
            console.log(results);
            store.delete(graph, function(err, results){
                console.log("DELETING: "+err+" :: "+results);
                store.execute('SELECT * { ?S ?P ?O }', function(err,results){
                    console.log(results);
                });
            });
        });
    });
});

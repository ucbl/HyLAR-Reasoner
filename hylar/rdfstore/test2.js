var rdfstore = require('./src/store');

var file ='@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\
\
<>\
    <http://purl.org/dc/terms/title> "WebID profile of Nicola Greco" ;\
    a <http://xmlns.com/foaf/0.1/PersonalProfileDocument> ;\
    <http://xmlns.com/foaf/0.1/maker> <#me> ;\
    <http://xmlns.com/foaf/0.1/primaryTopic> <#me> .\
\
<#key>\
    a <http://www.w3.org/ns/auth/cert#RSAPublicKey> ;\
    <http://www.w3.org/ns/auth/cert#exponent> "65537"^^<http://www.w3.org/2001/XMLSchema#int> ;\
    <http://www.w3.org/ns/auth/cert#modulus> "bbaf9c691762d6c66b66912cbd7adb1804bac634834a6f829184c9df2bb76a312b23267bc45807d0afdf53b84d4ac78a77314295b71325ea488bededdf44ea730c33e5e1d7c98807fcdaa8b6fe72ae994cacd477e40dd90af67696b7eb8ef12d2519414b00b9c5c87ff85876e5c49e66a73c44ac1c1cb7a7152ebb65e7fac84615f81fa3066d90983b468e2e5cc68b345460f51f02ca477a2987fdb83ec1db067613b561f256341eb619fd914ed5ffce7194d9a8d26b345a90bf9cc5d4ae8b4b793d32936ee91dec3f12b28744d0dcfb7a7d77c7215dab0778cf3d3fe4201daaca93c9faa6e7c7869df0de50ce48b04311f050eaa9749f5b1c8f040c4e7b1657"^^<http://www.w3.org/2001/XMLSchema#hexBinary> .\
\
<#me>\
    a <http://xmlns.com/foaf/0.1/Person> ;\
    <http://www.w3.org/ns/auth/cert#key> <#key> ;\
    <http://www.w3.org/ns/pim/space#preferencesFile> <../Preferences/prefs> ;\
    <http://www.w3.org/ns/ui#backgroundImage> <van%20gogh%20gigapixel.png> ;\
    <http://xmlns.com/foaf/0.1/img> <nicola%20machine%20drawing.jpg> ;\
    <http://xmlns.com/foaf/0.1/knows> <http://melvincarvalho.com/#me> ;\
    <http://xmlns.com/foaf/0.1/mbox> <mailto:me@nicolagreco.com> ;\
    <http://xmlns.com/foaf/0.1/name> "Nicola Greco" .';

var mimeType = 'text/n3';

rdfstore.create(function (err, store) {
    store.load(mimeType, file, function(err, loaded) {
        console.log("LOADSTORE", err, loaded);
        store.execute("SELECT * { ?S ?P ?O }", function(err, results){
            console.log(results.length);
        });
    });
});

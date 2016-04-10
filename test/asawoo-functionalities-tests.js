/**
 * Created by aifb on 06.04.16.
 */

var should = require('should');
var fs = require('fs');
var path = require('path');
var mime = require('mime-types');

var H = require('../hylar/hylar');
var repository = new H(),
    localfunctionalities = new H();

describe('Asawoo incomplete functionalities', function () {
    it('should return incomplete functionalities', function () {
        var owlRepository = fs.readFileSync(path.resolve(__dirname + '/ontologies/asawoo.jsonld')),
            extensionOwlRepository = path.extname(path.resolve(__dirname + '/ontologies/asawoo.jsonld')),
            completeIncompleteFuncts, incompleteFuncts,

            completeIncompleteFunctsQuery =
            'PREFIX asawoo: <http://liris.cnrs.fr/asawoo/vocab#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> CONSTRUCT { ?functType rdf:type ?functType } WHERE { <http://liris.cnrs.fr/asawoo#WindowMotor> asawoo:hasCapability ?capInstance . ?capInstance rdf:type ?capType . ?capType rdfs:subClassOf asawoo:Capability . { ?functType asawoo:isImplementedBy ?capType . } UNION { ?primaryFunctType asawoo:isImplementedBy ?capType . ?functType asawoo:isComposedOf ?primaryFunctType . } }',

            incompleteFunctsQuery =
            'PREFIX asawoo: <http://liris.cnrs.fr/asawoo/vocab#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX owl: <http://www.w3.org/2002/07/owl#> CONSTRUCT { ?functType rdf:type ?functType } WHERE { ?functType asawoo:isComposedOf* ?primaryFunctType . ?primaryFunctType asawoo:isImplementedBy ?capType . FILTER NOT EXISTS { ?cap rdf:type ?capType . } }',

            insertLocalFunctionalitiesQuery,

            incompleteLocalFunctionalitiesQuery = 'PREFIX asawoo: <http://liris.cnrs.fr/asawoo/vocab#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT DISTINCT ?functType WHERE { ?functType asawoo:isComposedOf ?functCompType . ?functType asawoo:isComposedOf ?functCompType2 . ?functInstance2 rdf:type ?functCompType2 . FILTER NOT EXISTS { ?functInstance rdf:type ?functCompType . } }',

            mimeType = mime.contentType(extensionOwlRepository);

        if(mimeType) {
            mimeType = mimeType.replace(/;.*/g, '');
        }
        owlRepository = owlRepository.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');

        return repository.load(owlRepository, mimeType)
            .then(function(r) {
                // Getting complete and incomplete functionalities
                return repository.query(completeIncompleteFunctsQuery);
            })
            .then(function(r) {
                // Getting incomplete functionalities
                completeIncompleteFuncts = r.triples;
                return repository.query(incompleteFunctsQuery);
            })
            .then(function(r) {
                // Deducing local functionalities
                incompleteFuncts = r.triples;
                for (var i = 0; i < incompleteFuncts.length; i++) {
                    for (var j = 0; j < completeIncompleteFuncts.length; j++) {
                        if (completeIncompleteFuncts[j]) {
                            if (completeIncompleteFuncts[j].toString() == incompleteFuncts[i].toString()) {
                                delete completeIncompleteFuncts[j];
                            }
                        }
                    }
                }

                for (var i = 0; i < completeIncompleteFuncts.length; i++) {
                    if (completeIncompleteFuncts[i]) {
                        completeIncompleteFuncts[i].subject.nominalValue += '__instance__' + i;
                    }
                }

                insertLocalFunctionalitiesQuery = 'INSERT DATA { ' + completeIncompleteFuncts.join('') + '}';

                mimeType = mime.contentType(extensionOwlRepository);
                if(mimeType) {
                    mimeType = mimeType.replace(/;.*/g, '');
                }
                owlRepository = owlRepository.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');
                return localfunctionalities.load(owlRepository, mimeType);
            })
            .then(function(r) {
                // Inserting local instances
                return localfunctionalities.query(insertLocalFunctionalitiesQuery);
            })
            .then(function(r) {
                // Selecting incomplete functionalities from the local repo
                return localfunctionalities.query(incompleteLocalFunctionalitiesQuery)
            })
            .then(function(r) {
                r.length.should.equal(2);
                r[0]['functType']['value'].should.equal('http://liris.cnrs.fr/asawoo/functionality/temperatureRegulation')
                r[1]['functType']['value'].should.equal('http://liris.cnrs.fr/asawoo/functionality/temperatureRegulationBySMS')
            })
    });
});
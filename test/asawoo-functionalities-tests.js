/**
 * Created by aifb on 06.04.16.
 */

var should = require('should');
var fs = require('fs');
var path = require('path');
var mime = require('mime-types');

var H = require('../hylar/hylar');
var repository = new H();

describe('Asawoo incomplete functionalities', function () {
    it('should return incomplete functionalities', function () {
        var owlRepository = fs.readFileSync(path.resolve(__dirname + '/ontologies/functionalities.jsonld')).toString();

        return repository.load(owlRepository, 'application/json')
            .then(function(r) {
                // Getting complete and incomplete functionalities
                return repository.query('SELECT * WHERE { ?a <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://localhost:3000/ontology/vocabs/asawoo#Functionality> }');
            })
            .then(function(r) {
                1;
                return;
            })
    });
});
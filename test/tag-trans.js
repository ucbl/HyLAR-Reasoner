var should = require('should'),
    fs = require('fs');

var H = require('../hylar/hylar'),
    Hylar = new H();

Hylar.setTagBased();

describe('Transitive dependency', function () {
    it('should tag implicit facts', function () {
        var sparql = `INSERT DATA {
            <#a1> <#p> <#b1> .
            <#a1> <#p> <#c1> .
            <#b1> <#p> <#a2> .
            <#c1> <#p> <#a2> .

            <#a2> <#p> <#b2> .
            <#a2> <#p> <#c2> .
            <#b2> <#p> <#a3> .
            <#c2> <#p> <#a3> .

            <#p> a <http://www.w3.org/2002/07/owl#TransitiveProperty> .
        }`;

        return Hylar.query(sparql)
            .then(function(ok) {
                return ok;
            });
    });
});

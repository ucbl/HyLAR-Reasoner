var should = require('should'),
    fs = require('fs');

var H = require('../hylar/hylar'),
    Hylar = new H();

describe('RuleDep', function () {
    it('should display rule dependencies', function () {
        var data = '';
        for (var i = 0; i < Hylar.rules.length; i++) {
            var rule = Hylar.rules[i];
            data += rule.toString() + '\n';            
            for (var j = 0; j < Hylar.rules.length; j++) {
                var deprule = Hylar.rules[j];
                data += '\t\t' + deprule.toString() + '\n';
            }
        }
        fs.writeFileSync('ruledeps.txt', data, { flag : 'w' });
    });
});

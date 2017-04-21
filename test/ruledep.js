var should = require('should'),
    fs = require('fs');

var H = require('../hylar/hylar'),
    Hylar = new H();

describe('RuleDep', function () {
    it('should display rule dependencies', function () {
        var data = '';
        for (var i = 0; i < Hylar.rules.length; i++) {
            var rule = Hylar.rules[i];
            data += rule.toString() + ' -- may fire [' + rule.dependentRules.length + '] more rules\n';            
            for (var j = 0; j < rule.dependentRules.length; j++) {
                var deprule = rule.dependentRules[j];
                data += '\t\t' + deprule.toString() + '\n';
            }
            data+='\n';
        }
        fs.writeFileSync('ruledeps.txt', data, { flag : 'w' });
    });
});

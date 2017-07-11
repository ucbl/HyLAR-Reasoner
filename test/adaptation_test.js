/**
 * Created by aifb on 17.03.16.
 */

var should = require('should');

var Solver = require('../hylar/core/Logics/Solver');
var Fact = require('../hylar/core/Logics/Fact');
var Rule = require('../hylar/core/Logics/Rule');

this.parameters = {
    ontologySizeThreshold: 200,
    pingThreshold: 150,
    batteryLevelThreshold: 20
};

    // Q server C server
var fs1 = [
        new Fact('lowerOrEqualsSize', 'OntologySize', '200'),
        new Fact('lowerOrEqualsPercent', 'BatteryLevel', '20'),
        new Fact('lowerOrEqualsMs', 'Ping', '150')
    ],

    // Q client C server
    fs2 = [
        new Fact('lowerOrEqualsSize', 'OntologySize', '200'),
        new Fact('lowerOrEqualsPercent', 'BatteryLevel', '20'),
        new Fact('exceedsMs', 'Ping', '150')
    ],

    // Q client C client
    fs3 = [
        new Fact('lowerOrEqualsSize', 'OntologySize', '200'),
        new Fact('exceedsPercent', 'BatteryLevel', '20'),
        new Fact('lowerOrEqualsMs', 'Ping', '150')
    ],

    // Q client C client
    fs4 = [
        new Fact('lowerOrEqualsSize', 'OntologySize', '200'),
        new Fact('exceedsPercent', 'BatteryLevel', '20'),
        new Fact('exceedsMs', 'Ping', '150')
    ],

    // Q server C server
    fs5 = [
        new Fact('exceedsSize', 'OntologySize', '200'),
        new Fact('lowerOrEqualsPercent', 'BatteryLevel', '20'),
        new Fact('lowerOrEqualsMs', 'Ping', '150')
    ],

    // Q client C server
    fs6 = [
        new Fact('exceedsSize', 'OntologySize', '200'),
        new Fact('lowerOrEqualsPercent', 'BatteryLevel', '20'),
        new Fact('exceedsMs', 'Ping', '150')
    ],

    // Q client C server
    fs7 = [
        new Fact('exceedsSize', 'OntologySize', '200'),
        new Fact('exceedsPercent', 'BatteryLevel', '20'),
        new Fact('lowerOrEqualsMs', 'Ping', '150')
    ],

    // Q client C server
    fs8 = [
        new Fact('exceedsSize', 'OntologySize', '200'),
        new Fact('exceedsPercent', 'BatteryLevel', '20'),
        new Fact('exceedsMs', 'Ping', '150')
    ];

var rules = {
    queryingLocation: [
        new Rule(
            [new Fact('exceedsMs', 'Ping', this.parameters.pingThreshold.toString())],
            [new Fact('execLocation', 'QueryAnswering', 'client')]),

        new Rule(
            [new Fact('exceedsPercent', 'BatteryLevel', this.parameters.batteryLevelThreshold.toString())],
            [new Fact('execLocation', 'QueryAnswering', 'client')]),

        new Rule(
            [
                new Fact('lowerOrEqualsMs', 'Ping', this.parameters.pingThreshold.toString()),
                new Fact('lowerOrEqualsPercent', 'BatteryLevel', this.parameters.batteryLevelThreshold.toString())
            ],
            [new Fact('execLocation', 'QueryAnswering', 'server')])
    ],

    classifLocation: [
        new Rule(
            [new Fact('exceedsSize', 'OntologySize', this.parameters.ontologySizeThreshold.toString())],
            [new Fact('execLocation', 'Classification', 'server')]),

        new Rule(
            [new Fact('lowerOrEqualsPercent', 'BatteryLevel', this.parameters.batteryLevelThreshold.toString())],
            [new Fact('execLocation', 'Classification', 'server')]),

        new Rule(
            [
                new Fact('lowerOrEqualsSize', 'OntologySize', this.parameters.ontologySizeThreshold.toString()),
                new Fact('exceedsPercent', 'BatteryLevel', this.parameters.batteryLevelThreshold.toString())
            ],
            [new Fact('execLocation', 'Classification', 'client')])
    ]
};

describe('Adaptation tests', function () {
    it('should execute each task on the correct side', function () {
        var rsq = rules.queryingLocation,
            rsc = rules.classifLocation,
       promises = [Solver.evaluateRuleSet(rsq, fs1),
            Solver.evaluateRuleSet(rsc, fs1),
            Solver.evaluateRuleSet(rsq, fs2),
            Solver.evaluateRuleSet(rsc, fs2),
            Solver.evaluateRuleSet(rsq, fs3),
            Solver.evaluateRuleSet(rsc, fs3),
            Solver.evaluateRuleSet(rsq, fs4),
            Solver.evaluateRuleSet(rsc, fs4),
            Solver.evaluateRuleSet(rsq, fs5),
            Solver.evaluateRuleSet(rsc, fs5),
            Solver.evaluateRuleSet(rsq, fs6),
            Solver.evaluateRuleSet(rsc, fs6),
            Solver.evaluateRuleSet(rsq, fs7),
            Solver.evaluateRuleSet(rsc, fs7),
            Solver.evaluateRuleSet(rsq, fs8),
            Solver.evaluateRuleSet(rsc, fs8)];
        
        return Promise.all(promises).then(function(t) {            
            t[0].cons.length.should.equal(1);
            t[0].cons[0].object.should.equal('server');
            t[2].cons.length.should.equal(1);
            t[2].cons[0].object.should.equal('client');
            t[4].cons.length.should.equal(1);
            t[4].cons[0].object.should.equal('client');
            
            t[6].cons.forEach(function(e) {
                console.log(JSON.stringify(e.asString, null, 3))    
            })
            
            t[6].cons.length.should.equal(1);
            t[6].cons[0].object.should.equal('client');
            t[8].cons.length.should.equal(1);
            t[8].cons[0].object.should.equal('server');
            t[10].cons.length.should.equal(1);
            t[10].cons[0].object.should.equal('client');
            t[12].cons.length.should.equal(1);
            t[12].cons[0].object.should.equal('client');
            t[14].cons.length.should.equal(1);
            t[14].cons[0].object.should.equal('client');

            t[1].cons.length.should.equal(1);
            t[1].cons[0].object.should.equal('server');
            t[3].cons.length.should.equal(1);
            t[3].cons[0].object.should.equal('server');
            t[5].cons.length.should.equal(1);
            t[5].cons[0].object.should.equal('client');
            t[7].cons.length.should.equal(1);
            t[7].cons[0].object.should.equal('client');
            t[9].cons.length.should.equal(1);
            t[9].cons[0].object.should.equal('server');
            t[11].cons.length.should.equal(1);
            t[11].cons[0].object.should.equal('server');
            t[13].cons.length.should.equal(1);
            t[13].cons[0].object.should.equal('server');
            t[15].cons.length.should.equal(1);
            t[15].cons[0].object.should.equal('server');
        })

        
    });
});

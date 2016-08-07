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
    it('should execute each task on the client side', function () {
        var rsq = rules.queryingLocation,
            rsc = rules.classifLocation;
        var qfs1 = Solver.evaluateRuleSet(rsq, fs1),
            cfs1 = Solver.evaluateRuleSet(rsc, fs1),
            qfs2 = Solver.evaluateRuleSet(rsq, fs2),
            cfs2 = Solver.evaluateRuleSet(rsc, fs2),
            qfs3 = Solver.evaluateRuleSet(rsq, fs3),
            cfs3 = Solver.evaluateRuleSet(rsc, fs3),
            qfs4 = Solver.evaluateRuleSet(rsq, fs4),
            cfs4 = Solver.evaluateRuleSet(rsc, fs4),
            qfs5 = Solver.evaluateRuleSet(rsq, fs5),
            cfs5 = Solver.evaluateRuleSet(rsc, fs5),
            qfs6 = Solver.evaluateRuleSet(rsq, fs6),
            cfs6 = Solver.evaluateRuleSet(rsc, fs6),
            qfs7 = Solver.evaluateRuleSet(rsq, fs7),
            cfs7 = Solver.evaluateRuleSet(rsc, fs7),
            qfs8 = Solver.evaluateRuleSet(rsq, fs8),
            cfs8 = Solver.evaluateRuleSet(rsc, fs8);

        qfs1.length.should.equal(1);
        qfs1[0].object.should.equal('server');
        qfs2.length.should.equal(1);
        qfs2[0].object.should.equal('client');
        qfs3.length.should.equal(1);
        qfs3[0].object.should.equal('client');
        qfs4.length.should.equal(1);
        qfs4[0].object.should.equal('client');
        qfs5.length.should.equal(1);
        qfs5[0].object.should.equal('server');
        qfs6.length.should.equal(1);
        qfs6[0].object.should.equal('client');
        qfs7.length.should.equal(1);
        qfs7[0].object.should.equal('client');
        qfs8.length.should.equal(1);
        qfs8[0].object.should.equal('client');

        cfs1.length.should.equal(1);
        cfs1[0].object.should.equal('server');
        cfs2.length.should.equal(1);
        cfs2[0].object.should.equal('server');
        cfs3.length.should.equal(1);
        cfs3[0].object.should.equal('client');
        cfs4.length.should.equal(1);
        cfs4[0].object.should.equal('client');
        cfs5.length.should.equal(1);
        cfs5[0].object.should.equal('server');
        cfs6.length.should.equal(1);
        cfs6[0].object.should.equal('server');
        cfs7.length.should.equal(1);
        cfs7[0].object.should.equal('server');
        cfs8.length.should.equal(1);
        cfs8[0].object.should.equal('server');
    });
});

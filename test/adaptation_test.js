/**
 * Created by aifb on 17.03.16.
 */

var should = require('should');
var rules = require('../hylar/core/OWL2RL').rules;

var Solver = require('../hylar/core/Logics/Solver');
var Fact = require('../hylar/core/Logics/Fact');
var Rule = require('../hylar/core/Logics/Rule');

var facts = [
    new Fact('lowerOrEqualsSize', 'OntologySize', '200'),
    new Fact('exceedsPercent', 'BatteryLevel', '20'),
    new Fact('exceedsMs', 'Ping', '150')
];

this.parameters = {
    ontologySizeThreshold: 200,
        pingThreshold: 150,
        batteryLevelThreshold: 20
};

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
        var queryingLocationAnswer = Solver.evaluateRuleSet(rules.queryingLocation, facts),
            classificationLocationAnswer = Solver.evaluateRuleSet(rules.classifLocation, facts);

        queryingLocationAnswer.length.should.equal(1);
        queryingLocationAnswer[0].object.should.equal('client');
        classificationLocationAnswer.length.should.equal(1);
        classificationLocationAnswer[0].object.should.equal('client');
    });
});

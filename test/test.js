/*global describe, it */
'use strict';
(function () {
    var should = require('should');
    var POKER = require('../lib/poker.js').POKER;
    var tripAces, flush, straight, lowStraight;
    var handStrings = {
        straightFlushes: ['As 2s 3s 4s 5s', '7d 8d 9d Td Jd', 'Ah Kh Qh Jh Th'],
        quads: ['2s 2d 2h 2c Ac', '7d As Ac Ad Ah', 'Jd Jh 4s Js Jc'],
        fullHouses: ['As Ah Ad Ks Kc', '3s 2h 3s 2d 2c', '5d 5h Ks Kd Kh'],
        flushes: ['6h 7h Ah 3h 9h', '2s 3s 9s Js 5s', 'Td 3d Ad Kd Qd'],
        straights: ['Ad 2s 5d 4s 3c', '7s 8d 9h Th Js', 'As Jh Ts Qd Kc'],
        trips: ['7s 7c 7d 6h 2d', 'As 3h 5d Ac Ad', '5s Jd Qh Qd Qs'],
        twoPairs: ['2s 2c Ts Td Jh', '7s 9s Ad 9h 7c', 'Ad As 7h Kh Kd'],
        pairs: ['As Ad 7c 3s 4d', 'Jd 8h 2d Ts Jc', 'Ts 9s 8s 7s 9c'],
        highCards: ['Ad Qh 9s 4c 2h', '5h 6h Ts 2s Jh', '9s Ts Js Qs Ad']
    };
    var hands;
    var hType = POKER.HAND_TYPE;

    beforeEach(function() {
        tripAces = POKER.handFromString('As Ah Ad Ks 3c');
        flush = POKER.handFromString('7s 6s As Ks 3s');
        straight = POKER.handFromString('7s 6s 4c 3h 5s');
        lowStraight = POKER.handFromString('As 2s 4c 3h 5s');
        hands = makeHands(handStrings);
    });

    describe('Testing POKER module', function () {
        describe('POKER.Hand.numSameSuits()', function () {
            it('trip aces should have two same suits', function () {
                tripAces.numSameSuits().should.equal(2);
            });

            it('flush should have five same suits', function () {
                flush.numSameSuits().should.equal(5);
            });

        });

        describe('POKER.Hand.getOrderedRanks()', function () {
            it('straight should have 5 consecutive ordered ranks', function () {
                straight.getOrderedRanks().should.eql([3,4,5,6,7]);
            });

            it('flush ordered ranks should not be consecutive', function () {
                flush.getOrderedRanks().should.eql([3,6,7,13,14]);
            });
        });

        describe('POKER.Hand.numConnected()', function () {
            it('straight should have 5 connected ranks', function () {
                straight.numConnected().should.equal(5);
            });

            it('low straight should have 5 connected ranks', function () {
                lowStraight.numConnected().should.equal(5);
            });

            it('flush should have 2 connected ranks', function () {
                flush.numConnected().should.equal(2);
            });
        });

    });

    // create object where key is hand type (e.g. 'trips'), and value is an
    // array of Hand objects corresponding to that hand type
    function makeHands(handStrings) {
        var hands = {},
            hand;
        for (var handType in handStrings) {
            if (handStrings.hasOwnProperty(handType)) {
                // create corresponding key in hands
                hands[handType] = [];
                for (var idx = 0; idx < handStrings[handType].length; idx += 1) {
                    hand = POKER.handFromString(handStrings[handType][idx]);
                    hands[handType].push(hand);
                };
            }
        }
        return hands;
    }

    function allSameHandType(hands, expectedHandType) {
        for (var idx = 0; idx < hands.length; idx += 1) {
            hands[idx].getHandValue()[0].should.equal(expectedHandType, hands[idx]);
        };
    }
})();

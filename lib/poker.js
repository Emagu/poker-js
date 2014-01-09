var POKER = {
    rankToString: ['', '', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J',
        'Q', 'K', 'A'],
    suitToString: ['h', 'd', 'c', 's'],
    rankToInt: {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14},
    suitToInt: {'h': 0, 'd': 1, 'c': 2, 's': 3},
    HAND_TYPE: {'HIGH_CARD': 1, 'PAIR': 2, 'TWO_PAIR': 3, 'TRIPS': 4,
        'STRAIGHT': 5, 'FLUSH': 6, 'FULL_HOUSE': 7, 'QUADS': 8,
        'STRAIGHT_FLUSH': 9}
};

// an immutable Card object with a rank and a suit
POKER.Card = function(rank, suit) {
    this.getRank = function() {return rank};
    this.getSuit = function() {return suit};
    this.toString = function() {
        return POKER.rankToString[rank] + '' + POKER.suitToString[suit];
    }
};

// create Card object from string like 'As', 'Th' or '2c'
POKER.cardFromString = function(cardVal) {
    return new POKER.Card(
        POKER.rankToInt[cardVal[0]],
        POKER.suitToInt[cardVal[1]]
    );
};

// a poker Hand object consists of a set of Cards, and poker related functions
POKER.Hand = function(cards) {
    this.numSameSuits = function() {
        var counters = [0, 0, 0, 0];
        for (var idx = 0; idx < cards.length; idx += 1) {
            counters[cards[idx].getSuit()] += 1;
        };
        return Math.max.apply(null, counters);
    };

    // number of longest consecutive card rank run
    this.numConnected = function() {
        var oRanks = this.getOrderedRanks(),
            run = max = 1,
            thisCardRank, prevCardRank;

        for (var idx = 1; idx < oRanks.length; idx += 1) {
            thisCardRank = oRanks[idx];
            prevCardRank = oRanks[idx - 1];
            if (thisCardRank !== prevCardRank + 1) {
                run = 1;
            }
            else {
                run = run + 1;
                max = run > max ? run : max;
            }
        }
        if (isLowStraight(oRanks)) {
            return 5;
        }
        return max;
    };

    // return ranks ordered lowest to highest: 2..14 (ace plays high)
    this.getOrderedRanks = function(desc) {
        var ranks = [];
        for (var idx = 0; idx < cards.length; idx += 1) {
            ranks.push(parseInt(cards[idx].getRank(), 10));
        };
        return ranks.sort(numeric);
    };

    // special case where A plays low for A to 5 straight
    function isLowStraight(oRanks) {
        var lowFourCards = oRanks.slice(0, 4);
        // if 2,3,4,5 and Ace in hand
        if (equivIntArrays(lowFourCards, [2,3,4,5]) && oRanks.indexOf(14) > -1) {
            return true;
        }
        return false;
    }

    // true if two int arrays identical
    function equivIntArrays(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        for (var idx = 0; idx < a.length; idx += 1) {
            if (a[idx] !== b[idx]) {
                return false;
            }
        }
        return true;
    }

    // return count of same ranked cards, e.g. [3,2] for fullhouse
    this.numOfAKind = function() {
        var rankCount = this.getRankCount(),
            values = objToArray(rankCount),
            numKind = values.sort(numeric).reverse();
        return numKind;
    };

    function numeric(a, b) {
        return a - b;
    }

    // map each rank to number of times it occurs in hand
    this.getRankCount = function() {
        var oRanks = this.getOrderedRanks(),
            rankCount = {};
        for (var idx = 0; idx < oRanks.length; idx += 1) {
            if (rankCount[oRanks[idx]]) {
                rankCount[oRanks[idx]] += 1;
            }
            else {
                rankCount[oRanks[idx]] = 1;
            }
        }
        return rankCount;
    };

    // return obj values as array
    function objToArray(obj) {
        var values = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                values.push(obj[key]);
            }
        }
        return values;
    }

    // 99887: getRankByOccurance(2) => [9,8]
    this.getRankByOccurance = function(n) {
        var rankCount = this.getRankCount(),
            matchedRanks = [];

        for (var rank in rankCount) {
            if (rankCount.hasOwnProperty(rank)) {
                if (rankCount[rank] === n) {
                    matchedRanks.push(parseInt(rank, 10));
                }
            }
        }
        // if low straight, special case
        if (n === 1 && isLowStraight(this.getOrderedRanks())) {
            return [5,4,3,2,1];
        }

        return matchedRanks.sort(numeric).reverse();
    };

    // return array: [hand_type, primary, secondary, ...] that allows comparing
    // of hand values (highest element in left to right comparison wins)
    this.getHandValue = function () {
        if (this.numSameSuits() === 5 && this.numConnected() === 5) {
            return [POKER.HAND_TYPE.STRAIGHT_FLUSH].
                concat(this.getRankByOccurance(1));
        };
        if (this.numOfAKind()[0] === 4) {
            return [POKER.HAND_TYPE.QUADS].
                concat(this.getRankByOccurance(4), this.getRankByOccurance(1));
        };
        if (equivIntArrays(this.numOfAKind(), [3,2])) {
            return [POKER.HAND_TYPE.FULL_HOUSE].
                concat(this.getRankByOccurance(3), this.getRankByOccurance(2));
        };
        if (this.numSameSuits() === 5 && this.numConnected() < 5) {
            return [POKER.HAND_TYPE.FLUSH].concat(this.getRankByOccurance(1));
        };
        if (this.numConnected() === 5 && this.numSameSuits() < 5) {
            return [POKER.HAND_TYPE.STRAIGHT].
                concat(this.getRankByOccurance(1));
        };
        if (equivIntArrays(this.numOfAKind(), [3,1,1])) {
            return [POKER.HAND_TYPE.TRIPS].
                concat(this.getRankByOccurance(3), this.getRankByOccurance(1));
        };
        if (equivIntArrays(this.numOfAKind(), [2,2,1])) {
            return [POKER.HAND_TYPE.TWO_PAIR].
                concat(this.getRankByOccurance(2), this.getRankByOccurance(1));
        };
        if (equivIntArrays(this.numOfAKind(), [2,1,1,1])) {
            return [POKER.HAND_TYPE.PAIR].
                concat(this.getRankByOccurance(2), this.getRankByOccurance(1));
        };
        return [POKER.HAND_TYPE.HIGH_CARD].concat(this.getRankByOccurance(1));
    };

    this.toString = function() {
        var str = '';
        for (var idx = 0; idx < cards.length; idx += 1) {
            str += cards[idx].toString() + ' ';
        };
        return str.slice(0, str.length - 1);
    }
};

// create Hand object from string like 'As Ks Th 7c 4s'
POKER.handFromString = function(handString) {
    var cardStrings = handString.split(' '),
        cards = [];
    for (var idx = 0; idx < cardStrings.length; idx += 1) {
        cards.push(POKER.cardFromString(cardStrings[idx]));
    };
    return new POKER.Hand(cards);
};

// a deck of Card objects
POKER.Deck = function() {
    var cards = [],
        dealt = [];

    createCards();

    function createCards() {
        for (var suitIdx = 0; suitIdx < 4; suitIdx += 1) {
            for (var rankIdx = 2; rankIdx < 15; rankIdx += 1) {
                cards.push(new POKER.Card(rankIdx, suitIdx));
            }
        }
    }

    this.size = function() {
        return cards.length;
    };

    // return numCards from deck (or less if deck exhausted)
    this.deal = function(numCards) {
        var cardArray = [],
            len = Math.min(numCards, cards.length);
        for (var idx = 0; idx < len; idx += 1) {
            card = cards.pop();
            cardArray.push(card);
            dealt.push(card);
        }
        return cardArray;
    };

    // shuffle the deck (implicitly returns deck to full size)
    this.shuffle = function() {
        returnDealtCards();
        // shuffle the deck
        fyShuffle(cards);
    };

    function returnDealtCards() {
        var len = dealt.length;
        while (len--) {
            cards.push(dealt.pop());
        }
    }

    // Fisher-Yates shuffle code found at:
    // http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
    // swap each element in cards with a random other element
    function fyShuffle(array) {
        var counter = array.length, temp, index;
        while (counter > 0) {
            index = Math.floor(Math.random() * counter);
            counter--;
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }

    this.toString = function() {
        return cards.toString();
    };
};

// compare an array of Hands and return the winner(s) in an array
POKER.getWinners = function(hands) {
    var numberValues = getNumberValues(hands),
        winningHandValue = Math.max.apply(Math, numberValues),
        winnerIndices = getIndicesOfVal(numberValues, winningHandValue);

    return getWinningHands(winnerIndices);

    //
    function getNumberValues(hands) {
        var numberValues = [],
            valueArray;
        for (var idx = 0; idx < hands.length; idx += 1) {
            valueArray = hands[idx].getHandValue();
            numberValues.push(handValueToNumber(valueArray));
        };
        return numberValues;
    }

    // convert a hand value from an array to a fixed number
    // eg: [12,3,4] => 1203040000
    function handValueToNumber(valueArray) {
        var strArray = [],
            paddedValueArray = valueArray.concat([0,0,0,0,0]).slice(0,6);
        for (var idx = 0; idx < paddedValueArray.length; idx += 1) {
            strArray.push(('0' + paddedValueArray[idx]).slice(-2));
        }
        return parseInt(strArray.join(''), 10);
    }


    // return all indices of array whose value === val (empty array if none)
    function getIndicesOfVal(array, val) {
        var idx = array.length,
            indices = [];
        while (idx--) {
            if (array[idx] === val) {
                indices.push(idx);
            }
        }
        return indices;
    }

    function getWinningHands(winnerIndices) {
        var winningHands = [];
        for (var idx = 0; idx < winnerIndices.length; idx += 1) {
            winningHands.push(hands[winnerIndices[idx]]);
        }
        return winningHands;
    }

};

// if in Node.js environment export the POKER namespace
if (typeof exports !== 'undefined') {
    exports.POKER = POKER;
}


// pull in the card data from a specified JSON file
var fs = require('fs');
var collection = JSON.parse(fs.readFileSync('quiz.json', 'utf8'));

// initially, set to just before the first card
var deck = 0 // TODO: Change to -1
var cardNum = -1;

// set to New deck
exports.setDeck = function(){}

// question accessor
exports.getCurrentQuestion = function(){
  return collection[deck].cards[cardNum].question;
}

// answer accessor
exports.getCurrentAnswer = function(){
  return collection[deck].cards[cardNum].answer;
}

// hint accessor
exports.getCurrentHint = function(){
  return collection[deck].cards[cardNum].hint;
}


// increment the cursor to move to the next card
exports.goToNextCard = function(){
  cardNum = (cardNum + 1) % collection[deck].cards.length;
}

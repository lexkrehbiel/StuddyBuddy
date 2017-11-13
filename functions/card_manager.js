
// pull in the card data from a specified JSON file
var fs = require('fs');
var cards = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// initially, set to just before the first card
var current = -1;

// question accessor
exports.getCurrentQuestion = function(){
  return cards[current].question;
}

// answer accessor
exports.getCurrentAnswer = function(){
  return cards[current].answer;
}

// hint accessor
exports.getCurrentHint = function(){
  return cards[current].hint;
}


// increment the cursor to move to the next card
exports.goToNextCard = function(){
  current = (current + 1) % cards.length;
}

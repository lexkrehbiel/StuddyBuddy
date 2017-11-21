
// pull in the card data from a specified JSON file
var fs = require('fs');
var collection = JSON.parse(fs.readFileSync('data.json', 'utf8'));
var deck = collection[0];

// initially, set to just before the first card
var current = -1;

// question accessor
exports.getCurrentQuestion = function(){
  return deck.cards[current].question;
}

// answer accessor
exports.getCurrentAnswer = function(){
  return deck.cards[current].answer;
}

// hint accessor
exports.getCurrentHint = function(){
  return deck.cards[current].hint;
}

// title accessor
exports.getCurrentTitle = function(){
  return deck.title;
}

// subject accessor
exports.getCurrentSubject = function(){
  return deck.subject;
}

// increment the cursor to move to the next card
exports.goToNextCard = function(){
  current = (current + 1) % cards.length;
}

// set the current deck
exports.setDeck = funtion(){
  deck = collection[0];
}


// pull in the card data from a specified JSON file
var fs = require('fs');
var decks = JSON.parse(fs.readFileSync('quiz.json', 'utf8'));

// initially, set to just before the first card
var current = -1;
var num = 0;

// question accessor
exports.getCurrentQuestion = function(){
  return (decks[num]).cards[current].question;
}

// answer accessor
exports.getCurrentAnswer = function(){
  return (decks[num]).cards[current].answer;
}

// hint accessor
exports.getCurrentHint = function(){
  return (decks[num]).cards[current].hint;
}

// title accessor
exports.getCurrentTitle = function(){
  return (decks[num]).title;
}

// subject accessor
exports.getCurrentSubject = function(){
  return (decks[num]).subject;
}

// increment the cursor to move to the next card
exports.goToNextCard = function(){
  current = (current + 1) % (decks[num]).cards.length;
}

// set the current deck
exports.setDeck = function(){
  num = 0;
}

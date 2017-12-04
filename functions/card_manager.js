
// pull in the card data from a specified JSON file
var fs = require('fs');
var decks = JSON.parse(fs.readFileSync('quiz.json', 'utf8'));
var ScoreKeeper = require('./score_keeper.js');

// initially, set to just before the first card
var current = -1;
var num = 0;

exports.getStickerName = function(deckName){

	if(deckName == null){
		return (decks[num]).sticker;
	}

	for(let i = 0; i < decks.length; i++){
		if(decks[i].sticker.toLowerCase() === deckName.toLowerCase()){
			return decks[i].sticker;
		}
	}

	for(let i = 0; i < decks.length; i++){
		for(let j = 0; j < decks[i].title.length; j++){
			if(decks[i].title[j].toLowerCase() === deckName.toLowerCase()){
				return decks[i].sticker;
			}
		}
	}

	return null;
}

// question accessor
exports.getCurrentQuestion = function(){
  return (decks[num]).cards[current%decks[num].cards.length].question;
}

// answer accessor
exports.getCurrentAnswer = function(){
  return (decks[num]).cards[current%decks[num].cards.length].answer;
}

// hint accessor
exports.getCurrentHint = function(){
  return (decks[num]).cards[current%decks[num].cards.length].hint;
}

// title accessor
exports.getCurrentTitle = function(){
  return (decks[num]).title[0];
}

// subject accessor
exports.getCurrentSubject = function(){
  return (decks[num]).subject;
}

// sticker accessor
exports.getCurrentSticker = function(){
  return (decks[num]).sticker;
}

// increment the cursor to move to the next card
exports.goToNextCard = function(){
  current = (current + 1) % (decks[num]).cards.length;
}

// return list of decks
exports.getDecks = function(){
  var names = "";
  for (i = 0; i < (decks.length - 1); i++) {
    names += (decks[i]).title[0] + ", ";
  }
  names += (" and " + (decks[decks.length - 1]).title[0] + ".");
  return names;
}

function evaluate(correct_deck, user_deck){
	user_deck = user_deck.toLowerCase();

  for(let i = 0; i < correct_deck.length; i++){
    if(correct_deck[i].toLowerCase() == user_deck){
      return true;
    }
  }
  return false;
}

// set the current deck
exports.setDeck = function(name){
  for (i = 0; i < (decks.length); i++) {
    if (evaluate(decks[i].title,name)) {
      num = i;
      ScoreKeeper.setCurrentDeck(i);
      return true;
    }
  }
  return false;
}

// return the name of suggested deck
exports.getDeckSuggestion = function(){
  let deckRecommend = "";
  let num = Math.floor(Math.random() * (decks.length - 1));
  deckRecommend += decks[num % decks.length].title[0];
  deckRecommend += " and " + decks[(num + 1) % decks.length].title[0]
  return deckRecommend;
}

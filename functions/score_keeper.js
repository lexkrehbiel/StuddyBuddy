//Eventually have a deck JSON to track score per deck???
var fs = require('fs');
var decks = JSON.parse(fs.readFileSync('quiz.json', 'utf8'))[0];

var scoreDecks = [];

for(var i = 0; i < decks.length; i++){
	scoreDecks.push( {
		title: decks[i].title,
		subject: decks[i].subject,
		totalCards: decks[i].cards.length,,
		correct: 0,
		total: 0,
		streak: 0
	} );
}

var currentDeck = 0;

var thresh_correct = 0;
var thresh_streak = 0;
var wrong_thresh = 2;

var wrongStreak = 0;

var streak_threshold = generateThreshold(7, 13);
var correct_threshold = generateThreshold(10, 16);


var findDeck = function(deckName){
	for(var i = 0; i < scoreDecks.length; i++){
		if(scoreDecks[i].title == deckName){
			return scoreDecks[i];
		}
	}

	return null;
}

var generateThreshold = function(start, end){
	return Math.floor(Math.random() * (end-start)) + start;
}

exports.setCurrentDeck = function(deckNum){
	scoreDecks[currentDeck].streak = 0;
	currentDeck = deckNum;
	thresh_streak = 0;
	thresh_correct = 0;
}

exports.getCorrectCount = function(){
	return scoreDecks[currentDeck].correct;
}

exports.getTotalCount = function(){
	return scoreDecks[currentDeck].total;
}

exports.getStreakCount = function(){
	return scoreDecks[currentDeck].streak;
}

exports.getSkipCount = function(){
	return scoreDecks[currentDeck].total - scoreDecks[currentDeck].correct;
}

exports.getCorrectCount = function(deckName){
	let deck = findDeck(deckName);

	if(deck == NULL){
		return -1;
	}

	return scoreDecks[currentDeck].correct;
}

exports.getTotalCount = function(deckName){
	let deck = findDeck(deckName);

	if(deck == NULL){
		return -1;
	}

	return scoreDecks[currentDeck].total;
}

exports.getSkipCount = function(deckName){
	let deck = findDeck(deckName);

	if(deck == NULL){
		return -1;
	}
	
	return deck.total - deck.correct;
}


exports.markCorrect = function(){
	scoreDecks[currentDeck].correct++;
	scoreDecks[currentDeck].total++;
	scoreDecks[currentDeck].streak++;

	thresh_streak++;
	thresh_correct++;
	wrongStreak = 0;
}

exports.markWrong = function(){
	wrongStreak++;
}

exports.markSkip = function(){
	scoreDecks[currentDeck].total++;
	scoreDecks[currentDeck].streak = 0;
	thresh_streak = 0;
	wrongStreak = 0;
}


exports.atHintThreshold() = function(){
	if(wrongStreak > wrong_thresh){
		wrongStreak = 0;
		return true;
	}
	return false;
}

exports.atRewardThreshold = function(){
	//Eventually integrate with some deck percentage
	
	if (thresh_correct > correct_threshold) || (thresh_streak > streak_threshold){
		streak_threshold = generateThreshold(7, 13);
		correct_threshold = generateThreshold(10, 16);

		thresh_streak = 0;
		thresh_correct = 0;

		return true;
	}

	return false;
}
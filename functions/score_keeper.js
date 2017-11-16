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

var streak_threshold = generateThreshold(7, 13);
var correct_threshold = generateThreshold(10, 16);


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


exports.markCorrect = function(){
	scoreDecks[currentDeck].correct++;
	scoreDecks[currentDeck].total++;
	scoreDecks[currentDeck].streak++;

	thresh_streak++;
	thresh_correct++;
}

exports.markSkip = function(){
	scoreDecks[currentDeck].total++;
	scoreDecks[currentDeck].streak = 0;
	thresh_streak = 0;
}

exports.atThreshold = function(){
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
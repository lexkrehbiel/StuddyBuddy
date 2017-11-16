//Eventually have a deck JSON to track score per deck???
//var fs = require('fs');
//var decks = JSON.parse(fs.readFileSync('decks.json', 'utf8'));

var total = 0;
var correct = 0;
var in_a_row = 0;

var thresh_correct = 0;
var thresh_streak = 0;

var streak_threshold = generateThreshold(7, 13);
var correct_threshold = generateThreshold(10, 16);

var generateThreshold = function(start, end){
	return Math.floor(Math.random() * (end-start)) + start;
}

exports.getCorrectCount = function(){
	return correct;
}

exports.getTotalCount = function(){
	return total;
}

exports.getStreakCount = function(){
	return in_a_row;
}

exports.getSkipCount = function(){
	return total - correct;
}


exports.markCorrect = function(){
	correct++;
	total++;
	in_a_row++;

	thresh_streak++;
	thresh_correct++;
}

exports.markSkip = function(){
	total++;
	in_a_row = 0;
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


/*
exports.markCorrect = function(deckNum){
	//We need to access some JSON for a deck to track your score within a given deck
}


exports.markSkip = function(deckNum){
	//We need to access some JSON for a deck to track your score within a given deck
}

exports.getCorrectCount = function(deckNum){
	//We need to access some JSON for a deck to track your score within a given deck
}

exports.getTotalCount = function(deckNum){
	//We need to access some JSON for a deck to track your score within a given deck
}


exports.getSkipCount = function(deckNum){
	//We need to access some JSON for a deck to track your score within a given deck
}
*/
'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
var Responses = require('./responses.js').Responses;
var Cards = require('./card_manager.js');
var ScoreKeeper = require('./score_keeper.js');

// ACTIONS
const ASSESS_ACTION = 'assess_response';
const NEW_CARD_ACTION = 'new_card';
const FIRST_NEW_CARD_ACTION = 'first_new_card';
const SET_DECK_ACTION = 'set_deck';
const LIST_DECK_ACTION = 'list_deck';
const QUIT_ACTION = 'quit';
const STATS_ACTION = 'stats';
const FALLBACK_ACTION = 'fallback';
const OPTIONS_ACTION = 'give_options'

const HINT_ACTION = 'hint';
const SKIP_ACTION = 'skip';
const REPEAT_ACTION = 'repeat';

// CONTEXTS
const ASSESS_CONTEXT = "assess";
const SELECT_CONTEXT = "select";
const HINT_CONTEXT = "hint";
const SWITCH_CONTEXT = "switch";

// ARGUMENTS
const ANSWER_ARGUMENT = 'answer';
const SUBJECT_ARGUMENT = 'subject';
const TITLE_ARGUMENT = 'title';
const STICKER_ARGUMENT = 'sticker'

var first_question = true;

var current = -1;

function evaluate(correct_ans, user_ans){
  for(let i = 0; i < correct_ans.length; i++){
    if(correct_ans[i] == user_ans){
      return true;
    }
  }
  return false;
}

// attach all the functions to studdyBuddy!
exports.studdyBuddy = functions.https.onRequest((request, response) => {

  // generate a new DialogflowApp
  const app = new App({request, response});

  function assessResponse(user_raw){

    console.error("Assess response called, raw input was \"" + user_raw + "\" , user said: " + app.getRawInput());

    var user_ans = user_raw.toLowerCase().replace(/,/g, '');
    var correct_ans = Cards.getCurrentAnswer();

    for(let i = 0; i < correct_ans.length; i++){
      correct_ans[i] = correct_ans[i].toLowerCase().replace(/,/g, '');
    }

    // if correct, alert user and move to a new card
    if ( evaluate(correct_ans, user_ans) ){
      app.setContext(ASSESS_CONTEXT);
      ScoreKeeper.markCorrect();

      console.error("User was correct");

      let switch_Deck = " "

      if(ScoreKeeper.atSwitchThreshold()){
        switch_Deck = " It looks like we reached the end of the deck, just let me know if you want to switch to another one, for now we'll go through again! "
      }

		  if(ScoreKeeper.atRewardThreshold()){
			//Do a different response remminding the user of their current progress, possibly encouraging them to swap decks.
        console.error("We are at the reward threshold");

        let sysResponse = Responses.good_job() + " " + Responses.getStats() + switch_Deck + Responses.new_card();

        console.error("System response is " + sysResponse);
		    app.ask( sysResponse );
      }
      else{

        let sysResponse = Responses.correct(user_raw) + switch_Deck + Responses.new_card();



        console.error("System response is " + sysResponse);

        app.ask( sysResponse );
      }
    }

    // if wrong, alert user and tell him to try again
    else {
      console.error("User was wrong, correct answer was \"" + Cards.getCurrentAnswer()[0] + "\"");
      // note that the answer was wrong
      ScoreKeeper.markWrong();

      // set context to re-assess
      app.setContext(ASSESS_CONTEXT);

      // generate the message for incorrect, prompting the user to try again
      var resp = Responses.incorrect_try_again(user_raw);

      // if we should remind the user of his options, do that as well
      if(ScoreKeeper.atRemindOptionsThreshold()){
        console.error("We are at the reminder threshold");
        resp += " "+Responses.give_options();
      }

      console.error("System response is " + resp);

      // send the generated response
      app.ask( resp );
    }

  }

  // check if the user's response is correct
  function doAssessResponse (app) {

    // get user's answer
    var answer = app.getArgument(ANSWER_ARGUMENT);

    // respond according to the answer in the argument
    assessResponse(answer);
  }

  // ask the user about a new card
  function getNewCard(app) {
    console.error("Getting new card, user said: " + app.getRawInput());

    let sysResponse = Resonses.new_card();

    console.error("System response is " + sysResponse);

    app.setContext(ASSESS_CONTEXT);
    app.ask( sysResponse );
  }

  // switch to user specified deck and give new card
  function setDeck(app) {

    let title = app.getArgument(TITLE_ARGUMENT);

    console.error("Trying to switch decks with title argument \"" + title + "\"");

    if( Cards.setDeck(title) ) {

      console.error("Valid title, switching to new deck, user said: " + app.getRawInput());

      let sysResponse = "Switched to deck " + Cards.getCurrentTitle() + ". You'll get a " + Cards.getCurrentSticker() + " sticker for each correct answer. " + Responses.new_card() + ".";

      console.error("System response is " + sysResponse);

      app.setContext(ASSESS_CONTEXT);

      app.ask( sysResponse );

    }

    else {
      console.error("Invalid title, asking again, user said: " + app.getRawInput());

      let sysResponse = "Could not find deck " + title + ". Try again or ask for available decks.";

      console.error("System response is " + sysResponse);

      app.setContext(SELECT_CONTEXT);
      app.ask( sysResponse );
    }
  }

  // list all the deck names
  function listDeck(app) {
    console.error("Listing desks, user said: " + app.getRawInput());

    let sysResponse = Responses.list_deck();

    console.error("System response is " + sysResponse);

    app.setContext(SELECT_CONTEXT);
    app.ask( sysResponse );
  }

  // ask the user about a new card after welcoming him
  function firstNewCard(app) {

    console.error("First New Card called, user said: " + app.getRawInput())

    let sysResponse = Responses.welcome() +  " " + Responses.ask_deck();

    console.error("System response is " + sysResponse);

    app.setContext(SELECT_CONTEXT);
    app.ask( sysResponse );
  }

  function quitStudy(app) {
    console.error("Quitting, user said: " + app.getRawInput());

    let sysResponse = Responses.exit();

    console.error("System response is " + sysResponse);

	  app.tell( sysResponse );
  }

  function getScore(app){
    console.error("Request for score, user said: " + app.getRawInput());

    var subject = app.getArgument(STICKER_ARGUMENT);

    let sysResponse = Responses.getStats(subject) + " " + Responses.repeat();

    console.error("System response is " + sysResponse);

    app.setContext(ASSESS_CONTEXT);

    app.ask( sysResponse );
  }


  function skip(app){
    console.error("Request to skip, user said: " + app.getRawInput());
    ScoreKeeper.markSkip();
    let sysResponse = Responses.skip(ScoreKeeper.atSwitchThreshold());

    console.error("System response is " + sysResponse);

    app.setContext(ASSESS_CONTEXT);
    app.ask( sysResponse );
  }

  function giveHint(app){
    console.error("Request a hint, user said: " + app.getRawInput());

    let sysResponse = Responses.hint();

    console.error("System response is " + sysResponse);

    app.setContext(ASSESS_CONTEXT);
    app.ask( sysResponse );
  }

  function repeatQuestion(app){
    console.error("Ask to repeat, user said: " + app.getRawInput());

    let sysResponse = Responses.acknowledge() + " " + Responses.repeat();

    console.error("System response is " + sysResponse);

    app.setContext(ASSESS_CONTEXT);
    app.ask( sysResponse );
  }

  function fallback(app){
    console.error("Fallback, user said: " + app.getRawInput());

    let sysResponse = Responses.oops() + " " + Responses.give_options();

    console.error("System response is " + sysResponse);

    app.setContext(ASSESS_CONTEXT);
    app.ask( sysResponse );
  }

  function giveOptions(app){
    console.error("Options, user said: " + app.getRawInput());

    let sysResponse = Responses.give_options_asked();

    console.error("System response is " + sysResponse);

    app.setContext(ASSESS_CONTEXT);
    app.ask( sysResponse );
  }

  let actionMap = new Map();
  actionMap.set(ASSESS_ACTION, doAssessResponse);
  actionMap.set(SKIP_ACTION, skip);
  actionMap.set(HINT_ACTION, giveHint);
  actionMap.set(NEW_CARD_ACTION, getNewCard);
  actionMap.set(FIRST_NEW_CARD_ACTION, firstNewCard);
  actionMap.set(SET_DECK_ACTION, setDeck);
  actionMap.set(LIST_DECK_ACTION, listDeck);
  actionMap.set(QUIT_ACTION, quitStudy);
  actionMap.set(STATS_ACTION, getScore);
  actionMap.set(REPEAT_ACTION, repeatQuestion);
  actionMap.set(FALLBACK_ACTION, fallback);
  actionMap.set(OPTIONS_ACTION, giveOptions);

  app.handleRequest(actionMap);
});

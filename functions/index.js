'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
var Responses = require('./responses.js').Responses;
var Cards = require('./card_manager.js');

// ACTIONS
const ASSESS_ACTION = 'assess_response';
const TRY_AGAIN_ACTION = 'try_again_answer';
const NEW_CARD_ACTION = 'new_card';
const FIRST_NEW_CARD_ACTION = 'first_new_card';
const QUIT_ACTION = 'quit';
const STATS_ACTION = 'stats';
const HINT_ACTION = 'hint';
const DECK_SELECT = 'deck_select';

// CONTEXTS
const ASSESS_CONTEXT = "assess";
const AGAIN_CONTEXT = "again";
const DECK_SELECT_CONTEXT = "deck";

// ARGUMENTS
const ANSWER_ARGUMENT = 'answer';
const TRY_AGAIN_ARGUMENT = 'try_again';

const YES = 'Yes';
const NO = 'No';

var current = -1;
var correctCount = 0;
var skipCount = 0;
var againCount = 0;
var secondTry = false;

function getStats(){
    return "You have answered " + correctCount + " out of " + (correctCount+skipCount) + " total questions";
}

function getBackTo(){
    return "Would you like to go back to your last card?"
}

// attach all the functions to studdyBuddy!
exports.studdyBuddy = functions.https.onRequest((request, response) => {

  // generate a new DialogflowApp
  const app = new App({request, response});

  function assessResponse(user_raw){

    var user_ans = user_raw.toLowerCase();
    var correct_ans = Cards.getCurrentAnswer().toLowerCase();

    // if correct, alert user and move to a new card
    if ( user_ans == correct_ans ){
      app.setContext(ASSESS_CONTEXT);
      app.ask( Responses.correct(user_raw) + " " + Responses.new_card() );
    }

    // if wrong, alert user and ask to try again
    else {
      app.setContext(AGAIN_CONTEXT);
      app.ask( Responses.incorrect_try_again(user_raw) );
    }

  }

  // check if the user's response is correct
  function doAssessResponse (app) {

    // get user's answer
    var answer = app.getArgument(ANSWER_ARGUMENT);

    // respond according to the answer in the argument
    assessResponse(answer);
  }

  // get the user's response to whether he wants to try again
  function tryAgain(app) {

    // get the arguments given by the user
    let try_again = app.getArgument(TRY_AGAIN_ARGUMENT);
    let answer = app.getArgument(ANSWER_ARGUMENT);

    // if he doesn't want to try again, give him the answer and move on.
    if ( try_again == NO){
      app.setContext(ASSESS_CONTEXT);
      app.ask( Responses.incorrect_give_answer() + " " + Responses.new_card() );
    }

    // if he does want to try again but didn't give an answer, ask for the answer
    else if ( try_again == YES && answer == null){
      app.setContext(ASSESS_CONTEXT);
      app.ask( Responses.ask_answer() );
    }

    // if he gave an answer, check it
    else if ( try_again == YES && answer != null ) {

      // respond according to the answer given
      assessResponse(answer);

    }
  }

  // ask the user about a new card
  function getNewCard(app) {
    app.setContext(ASSESS_CONTEXT);
    app.ask( Resonses.new_card() );
  }

  // ask the user to select a deck
  function selectDeck(app) {
    app.ask( Responses.ask_deck() );
    // TODO: Add sugesponsegestions on topics to study.
  }

  // user says he wants to switch
  function switchDeck(app) {
    app.setContext(DECK_SELECT_CONTEXT);
  }

  // ask the user about a new card after welcoming him
  function firstNewCard(app) {
    app.setContext(ASSESS_CONTEXT);
    app.ask( Responses.welcome() +  " " + Responses.new_card());
  }

  function quitStudy(app) {
	  app.tell("Thanks for studying with us! Have a great day!");
  }

  function getScore(app){
    app.setContext(AGAIN_CONTEXT);
    app.ask(getStats() + "\n" + getBackTo());
  }

  let actionMap = new Map();
  actionMap.set(ASSESS_ACTION, doAssessResponse);
  actionMap.set(TRY_AGAIN_ACTION, tryAgain);
  actionMap.set(NEW_CARD_ACTION, getNewCard);
  actionMap.set(FIRST_NEW_CARD_ACTION, firstNewCard);
  actionMap.set(QUIT_ACTION, quitStudy);
  actionMap.set(STATS_ACTION, getScore);

  app.handleRequest(actionMap);
});

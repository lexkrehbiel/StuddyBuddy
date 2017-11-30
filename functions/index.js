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
const SELECT_DECK_ACTION = 'select_deck';
const LIST_DECK_ACTION = 'list_deck';
const SWITCH_DECK_ACTION = 'switch_deck';
const QUIT_ACTION = 'quit';
const STATS_ACTION = 'stats';
const FALLBACK_ACTION = 'fallback';

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

var first_question = true;

var current = -1;

// attach all the functions to studdyBuddy!
exports.studdyBuddy = functions.https.onRequest((request, response) => {

  // generate a new DialogflowApp
  const app = new App({request, response});

  function assessResponse(user_raw){

    var user_ans = user_raw.toLowerCase();
    var correct_ans = Cards.getCurrentAnswer().toLowerCase().replace(/,/g, '');

    // if correct, alert user and move to a new card
    if ( user_ans == correct_ans ){
      app.setContext(ASSESS_CONTEXT);
      ScoreKeeper.markCorrect();


		  if(ScoreKeeper.atRewardThreshold()){
			//Do a different response remminding the user of their current progress, possibly encouraging them to swap decks.
		    app.ask( Responses.good_job() + " " + Responses.getStats() + " " + Responses.new_card());
      }
      else{


        app.ask( Responses.correct(user_raw) + " " + Responses.new_card() );
      }
    }

    // if wrong, alert user and tell him to try again
    else {

      // note that the answer was wrong
      ScoreKeeper.markWrong();

      // set context to re-assess
      app.setContext(ASSESS_CONTEXT);

      // generate the message for incorrect, prompting the user to try again
      var resp = Responses.incorrect_try_again(user_raw);

      // if we should remind the user of his options, do that as well
      if(ScoreKeeper.atRemindOptionsThreshold()){
        resp += " "+Responses.give_options();
      }

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
    app.setContext(ASSESS_CONTEXT);
    app.ask( Resonses.new_card() );
  }

  // switch to user specified deck and give new card
  function switchDeck(app) {
    let title = app.getArgument(TITLE_ARGUMENT);
    if( Cards.setDeck(title) ) {
      app.setContext(ASSESS_CONTEXT);
      app.ask( "Switched to deck " + Cards.getCurrentTitle() + ". " + Responses.new_card() );
    }
    else {
      app.setContext(SELECT_CONTEXT);
      app.ask( "Could not find deck " + title + ". Try again or ask for available decks.");
    }
  }

  // list all the deck names
  function listDeck(app) {
    app.setContext(SELECT_CONTEXT);
    app.ask( Responses.list_deck() );
  }

  // user says he wants to switch
  function selectDeck(app) {
    app.setContext(SELECT_CONTEXT);
    app.ask( Responses.select_deck() );
  }

  // ask the user about a new card after welcoming him
  function firstNewCard(app) {
    app.setContext(SELECT_CONTEXT);
    app.ask( Responses.welcome() +  " " + Responses.select_deck() );
  }

  function quitStudy(app) {
	  app.tell( Responses.exit() );
  }

  function getScore(app){
    app.setContext(ASSESS_CONTEXT);
    var subject = app.getArgument(SUBJECT_ARGUMENT);
    app.ask(Responses.getStats(subject) + " " + Responses.repeat());
  }


  function skip(app){
    app.setContext(ASSESS_CONTEXT);
    app.ask( Responses.skip() );
  }

  function giveHint(app){
    app.setContext(ASSESS_CONTEXT);
    app.ask( Responses.hint() );
  }

  function repeatQuestion(app){
    app.setContext(ASSESS_CONTEXT);
    app.ask( Responses.acknowledge() + " " + Responses.repeat() );
  }

  function fallback(app){
    app.setContext(ASSESS_CONTEXT);
    app.ask( Responses.misunderstood() + " " + Responses.give_options() );
  }

  let actionMap = new Map();
  actionMap.set(ASSESS_ACTION, doAssessResponse);
  actionMap.set(SKIP_ACTION, skip);
  actionMap.set(HINT_ACTION, giveHint);
  actionMap.set(NEW_CARD_ACTION, getNewCard);
  actionMap.set(FIRST_NEW_CARD_ACTION, firstNewCard);
  actionMap.set(SELECT_DECK_ACTION, selectDeck);
  actionMap.set(LIST_DECK_ACTION, listDeck);
  actionMap.set(SWITCH_DECK_ACTION, switchDeck);
  actionMap.set(QUIT_ACTION, quitStudy);
  actionMap.set(STATS_ACTION, getScore);
  actionMap.set(REPEAT_ACTION, repeatQuestion);
  actionMap.set(FALLBACK_ACTION, fallback)

  app.handleRequest(actionMap);
});

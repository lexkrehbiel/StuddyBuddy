'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
var Responses = require('./responses.js').Responses;
var Cards = require('./card_manager.js');
var ScoreKeeper = require('./score_keeper.js');

// ACTIONS
const ASSESS_ACTION = 'assess_response';
const TRY_AGAIN_ACTION = 'try_again_answer';
const NEW_CARD_ACTION = 'new_card';
const FIRST_NEW_CARD_ACTION = 'first_new_card';
const SELECT_DECK_ACTION = 'select_deck';
const LIST_DECK_ACTION = 'list_deck';
const SWITCH_DECK_ACTION = 'switch_deck';
const QUIT_ACTION = 'quit';
const STATS_ACTION = 'stats';

const ASK_HINT_ACTION = 'ask_hint';
const HINT_ACTION = 'hint';
const SKIP_ACTION = 'skip';

// CONTEXTS
const ASSESS_CONTEXT = "assess";
const AGAIN_CONTEXT = "again";
const ASK_HINT_CONTEXT = "hint";
const SELECT_CONTEXT = "select";
const HINT_CONTEXT = "hint";
const SWITCH_CONTEXT = "switch";

// ARGUMENTS
const ANSWER_ARGUMENT = 'answer';
const TRY_AGAIN_ARGUMENT = 'try_again';
const GET_HINT_ARGUMENT = 'y_n_hint';
const SUBJECT_ARGUMENT = 'subject';
const TITLE_ARGUMENT = 'title';


const YES = 'Yes';
const NO = 'No';

var current = -1;

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
      ScoreKeeper.markCorrect();

      
		  if(ScoreKeeper.atRewardThreshold()){
			//Do a different response remminding the user of their current progress, possibly encouraging them to swap decks.
		    app.ask( Responses.good_job() + " " + getStats() + " " + Responses.new_card());
      }
      else{
      

        app.ask( Responses.correct(user_raw) + " " + Responses.new_card() );
      }
    }

    // if wrong, alert user and ask to try again
    else {

      ScoreKeeper.markWrong();

      
      if(ScoreKeeper.atHintThreshold()){
        app.setContext(ASK_HINT_CONTEXT);
        app.ask("Ah well, would you like a hint?");
      }
      else{
      

        app.setContext(AGAIN_CONTEXT);
        app.ask( Responses.incorrect_try_again(user_raw) );
      }
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

      //ScoreKeeper.markSkip(deckNum);

      ScoreKeeper.markSkip();
      app.ask( Responses.incorrect_give_answer() + " " + Responses.new_card() );
    }

    // if he does want to try again but didn't give an answer, ask for the answer
    else if ( try_again == YES && answer == null){
      app.setContext(ASSESS_CONTEXT);
      app.ask( Responses.ask_answer() );
    }

    // if he gave an answer, check it
    else if ( answer != null ) {

      // respond according to the answer given
      app.setContext(ASSESS_CONTEXT);
      assessResponse(answer);

    }
  }

  function ask_hint(app){
    let get_hint = app.getArgument(GET_HINT_ARGUMENT);

    if(get_hint == YES){
      app.setContext(ASSESS_CONTEXT);
      app.ask( Cards.getCurrentHint() + " Let's try this again!" );
    }

    else if (get_hint == NO){
      app.setContext(AGAIN_CONTEXT);
      app.ask( Responses.getBackTo(app) );
    }
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
      app.ask( "Switched to deck " + Cards.getCurrentTitle() + ".\' " + Responses.new_card() );
    }
    else {
      app.ask( "Could not find deck " + title );
    }
  }

  // list all the deck names
  function listDeck(app) {
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
    app.ask( Responses.welcome() +  " \' " + Responses.select_deck() );
  }

  function quitStudy(app) {
	  app.tell( Responses.exit() );
  }

  function getScore(app){
    
    app.ask(Responses.getStats(app.getArgument(SUBJECT_ARGUMENT)) + "\n" + Responses.getBackTo(app));
  }


  function skip(app){
    app.setContext(ASSESS_CONTEXT);
    app.ask( Responses.skip() );
  }
  function giveHint(app){
    app.setContext(ASSESS_CONTEXT);
    app.ask( Responses.hint() );
  }

  let actionMap = new Map();
  actionMap.set(ASSESS_ACTION, doAssessResponse);
  actionMap.set(SKIP_ACTION, skip);
  actionMap.set(TRY_AGAIN_ACTION, tryAgain);
  actionMap.set(HINT_ACTION, giveHint);
  actionMap.set(NEW_CARD_ACTION, getNewCard);
  actionMap.set(FIRST_NEW_CARD_ACTION, firstNewCard);
  actionMap.set(SELECT_DECK_ACTION, selectDeck);
  actionMap.set(LIST_DECK_ACTION, listDeck);
  actionMap.set(SWITCH_DECK_ACTION, switchDeck);
  actionMap.set(QUIT_ACTION, quitStudy);
  actionMap.set(STATS_ACTION, getScore);
  actionMap.set(ASK_HINT_ACTION, ask_hint)

  app.handleRequest(actionMap);
});

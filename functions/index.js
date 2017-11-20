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
const QUIT_ACTION = 'quit';
const STATS_ACTION = 'stats';
const HINT_ACTION = 'hint';

// CONTEXTS
const ASSESS_CONTEXT = "assess";
const AGAIN_CONTEXT = "again";
const HINT_CONTEXT = "hint";
const SWITCH_CONTEXT = "switch";

// ARGUMENTS
const ANSWER_ARGUMENT = 'answer';
const TRY_AGAIN_ARGUMENT = 'try_again';
const GET_HINT_ARGUMENT = 'y_n_hint';
const SUBJECT_ARGUMENT = 'subject';


const YES = 'Yes';
const NO = 'No';

var current = -1;

function getStats(deckName){

    if(deckName == NULL){
      let scoreRes = ScoreKeeper.getCorrectCount();
      let totalRes = ScoreKeeper.getTotalCount();
    }
    else{
      let scoreRes = ScoreKeeper.getCorrectCount(deckName);

      if(scoreRes == -1){
        return "Sorry that's not a deck that we currently support";
      }

      let totalRes = ScoreKeeper.getTotalCount(deckName);
    }


    return "You have answered " + scoreRes + " out of " + totalRes + " total questions in the " + deckName + " deck";
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

      
      if(ScoreKeeper.atWrongThreshold()){
        //Do a different response remminding the user of their current progress, possibly encouraging them to swap decks.
        app.setContext(HINT_CONTEXT);
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
    else if ( try_again == YES && answer != null ) {

      // respond according to the answer given
      assessResponse(answer);

    }
  }

  function ask_hint(app){
    let get_hint = app.getArgument(GET_HINT_ARGUMENT);

    if(get_hint == YES){
      app.setContext(ASSESS_CONTEXT);
      app.ask( Cards.getCurrentHint() + " Let's try this again!" );
    }

    else{
      app.setContext(AGAIN_CONTEXT);
      app.ask( Responses.incorrect_try_again(user_raw) );
    }
  }

  // ask the user about a new card
  function getNewCard(app) {
    app.setContext(ASSESS_CONTEXT);
    app.ask( Resonses.new_card() );
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
    
    app.ask(getStats(app.getArgument(SUBJECT_ARGUMENT)) + "\n" + Responses.getBackTo(app));
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

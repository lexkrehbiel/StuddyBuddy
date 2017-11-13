'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
var Responses = require('./responses.js').Responses;
var rate = require('./assessment.js').rating;
var ratings = require('./constants.js').ratings;
var Cards = require('./card_manager.js');
var shell = require('shelljs');

// ACTIONS
const ASSESS_ACTION = 'assess_response';
const TRY_AGAIN_ACTION = 'try_again_answer';
const NEW_CARD_ACTION = 'new_card';
const FIRST_NEW_CARD_ACTION = 'first_new_card';

// CONTEXTS
const ASSESS_CONTEXT = "assess";
const AGAIN_CONTEXT = "again";

// ARGUMENTS
const ANSWER_ARGUMENT = 'answer';
const TRY_AGAIN_ARGUMENT = 'try_again';

const YES = 'Yes';
const NO = 'No';

// attach all the functions to studdyBuddy!
exports.studdyBuddy = functions.https.onRequest((request, response) => {

  // generate a new DialogflowApp
  const app = new App({request, response});

  function assessResponse(user_ans){

    var correct_ans = Cards.getCurrentAnswer();

    // transfer control to the command line, calling the python script for diarization
    shell.exec('python '+__dirname+ '/compare_keywords.py '+user_ans+' '+correct_ans, function(err,results){
      if (err) app.tell(err);

      app.tell("correctness: "+results);
    })

    // rate the agreement
    //rate(user_ans, correct_ans)

    // respond accordingly
    //.then (function(correctness){

      // spawn the python process
      //var process = spawn('python',[__dirname + "/compare_keywords.py", user_ans, correct_ans]);

      // when the python process returns data,
      // return the classification for the given percent agreement
      // process.stdout.on('data', function(data) {
      //     app.tell(data+" correctness");
      //   });

      // respond according to the level of correctness
    //  switch(correctness){

      //   // if correct, alert user and move to a new card
      //   case ratings.CORRECT:
      //     app.setContext(ASSESS_CONTEXT);
      //     app.ask( Responses.correct(answer) + " " + Responses.new_card() );
      //     break;
      //
      //   // if good, alert user, read answer, and move to a new card
      //   case ratings.GOOD:
      //     app.setContext(ASSESS_CONTEXT);
      //     app.ask( Responses.good(answer) + " " + Responses.new_card() );
      //     break;
      //
      //   // if almost, alert user and ask to try again
      //   case ratings.ALMOST:
      //     app.setContext(AGAIN_CONTEXT);
      //     app.ask( Responses.almost(answer) );
      //     break;
      //
      //   // if wrong, alert user and ask to try again
      //   case ratings.WRONG:
      //     app.setContext(AGAIN_CONTEXT);
      //     app.ask( Responses.incorrect_try_again(answer) );
      //     break;
      // }
    //})

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

  // ask the user about a new card after welcoming him
  function firstNewCard(app) {
    app.setContext(ASSESS_CONTEXT);
    app.ask( Responses.welcome() +  " " + Responses.new_card());
  }

  let actionMap = new Map();
  actionMap.set(ASSESS_ACTION, doAssessResponse);
  actionMap.set(TRY_AGAIN_ACTION, tryAgain);
  actionMap.set(NEW_CARD_ACTION, getNewCard);
  actionMap.set(FIRST_NEW_CARD_ACTION, firstNewCard);


  app.handleRequest(actionMap);
});

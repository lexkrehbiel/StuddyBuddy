'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');

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

// index of current card
var current = -1;

// dummy set of cards
var cards = [{
  term: "banana",
  definition: "a yellow fruit"
},{
  term: "apple",
  definition: "a red fruit"
},
{
  term: "grape",
  definition: "a small fruit"
}];


// canned response functions, self-explanatory by their titles
// later, we can replace these with arrays so it's less repetitive
var Responses = {
  correct : function(ans){
    return "\'"+ans + "\' is correct! Moving on...";
  },
  incorrect_try_again : function (ans){
    return "\'"+ans + "\' is incorrect. Would you like to try again?";
  },
  incorrect_give_answer : function (ans){
    return "Okay. The correct answer is "+cards[current].term+".";
  },
  ask_answer : function(){
    return "Ok! What do you think is the term that corresponds to "+cards[current].definition+"?";
  },
  new_card : function(){
    current++;
    current = current % cards.length;
    return "What is "+cards[current].definition+"?";
  },
  welcome : function(){
    return "Welcome to Study Buddy! Let's go!";
  }
}

// attach all the functions to studdyBuddy!
exports.studdyBuddy = functions.https.onRequest((request, response) => {

  // generate a new DialogflowApp
  const app = new App({request, response});

  // check if the user's response is correct
  function assessResponse (app) {

    // get user's answer
    var answer = app.getArgument(ANSWER_ARGUMENT);

    // if correct,
    if( answer == cards[current].term ){

      // move on
      app.setContext(ASSESS_CONTEXT);
      app.ask( Responses.correct(answer) + " " + Responses.new_card() );
    } else {

      // otherwise, ask to try again
      app.setContext(AGAIN_CONTEXT);
      app.ask( Responses.incorrect_try_again(answer) );
    }
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
      app.setContext(AGAIN_CONTEXT);
      app.ask( Responses.ask_answer() );
    }

    // if he gave an answer, check it
    else if ( try_again == YES && answer != null ) {
      if( answer == cards[current].term ){
        app.setContext(ASSESS_CONTEXT);
        app.ask( Responses.correct(answer) +  " " + Responses.new_card() );
      } else {
        app.setContext(AGAIN_CONTEXT);
        app.ask( Responses.incorrect_try_again(answer) );
      }
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
  actionMap.set(ASSESS_ACTION, assessResponse);
  actionMap.set(TRY_AGAIN_ACTION, tryAgain);
  actionMap.set(NEW_CARD_ACTION, getNewCard);
  actionMap.set(FIRST_NEW_CARD_ACTION, firstNewCard);


  app.handleRequest(actionMap);
});

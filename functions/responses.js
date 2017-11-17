// module for cards
var Cards = require('./card_manager.js');


// CONTEXTS
const ASSESS_CONTEXT = "assess";
const AGAIN_CONTEXT = "again";
const HINT_CONTEXT = "hint";
const SWITCH_CONTEXT = "switch";


// canned response functions, self-explanatory by their titles
// later, we can replace these with arrays so it's less repetitive
exports.Responses = {
  correct : function(ans){
    return "\'"+ans + "\' is correct! Moving on...";
  },
  incorrect_try_again : function (ans){
    return "\'"+ans + "\' is incorrect. Would you like to try again?";
  },
  incorrect_give_answer : function (ans){
    return "Okay. The correct answer is "+Cards.getCurrentAnswer()+".";
  },
  ask_answer : function(){
    return "Ok! Here's the question again: \'"+Cards.getCurrentQuestion()+"\'?";
  },
  new_card : function(){
    Cards.goToNextCard();
    return "Answer this: \'"+Cards.getCurrentQuestion()+"\'?";
  },
  welcome : function(){
    return "Welcome to Study Buddy! Let's go!";
  },
  getBackTo : function(app){
    switch(app.getContext()){
      case ASSESS_CONTEXT:
          //app.setContext(READ_AGAIN_CONTEXT)
          return "Would you like to go back to your last card?";
      case AGAIN_CONTEXT:
          //app.setContext(AGAIN_CONTEXT)
          return "Would you like to move on to the next card";
      case HINT_CONTEXT:
          //app.setContext(HINT_RETURN_CONTEXT)
          return "Would you like to hear that hint?";
      case SWITCH_CONTEXT:
          //app.setContext(SWITCH_AGAIN_CONTEXT)
          return "Let's get back to picking a topic"
    }
    return "DEBUG";
  }

}

// module for cards
var Cards = require('./card_manager.js');

// canned response functions, self-explanatory by their titles
// later, we can replace these with arrays so it's less repetitive
exports.Responses = {
  correct : function(ans){
    return "\'"+ans + "\' is correct! Moving on...";
  },
  good : function(ans, actual){
    return "\'"+ans + "\' is basically right! The correct answer was "+actual+". Moving on...";
  },
  almost : function(ans, actual){
    return "\'"+ans + "\' is close, but not quite right. Would you like to try again?";
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
  }
}

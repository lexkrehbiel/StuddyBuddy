// module for cards
var Cards = require('./card_manager.js');
var ScoreKeeper = require('./score_keeper.js');

// CONTEXTS
const ASSESS_CONTEXT = "assess";
const AGAIN_CONTEXT = "again";
const HINT_CONTEXT = "hint";
const SWITCH_CONTEXT = "switch";

function random(ceiling){
  return Math.floor(Math.random()*ceiling);
}


// canned response functions, self-explanatory by their titles
// later, we can replace these with arrays so it's less repetitive
exports.Responses = {
  correct : function(ans){
    return inQuotes( ans )
      + " " + random_response('correct')
      + " " + random_response('encouragement')
      + " " + random_response('forward');
  },
  incorrect_try_again : function (ans){
    return inQuotes( ans )
      + " " + random_response('incorrect')
      + " " + random_response('try_again');
  },
  incorrect_give_answer : function (ans){
    return random_response('acknowledge')
      + " " + random_response('give_answer')
      + " " + inQuotes( Cards.getCurrentAnswer() ) + "."
      + " " + random_response('forward');
  },
  ask_answer : function(){
    return random_response('acknowledge')
      + " " + random_response('repeat')
      + " " + inQuotes( Cards.getCurrentQuestion() );
  },
  new_card : function(){
    Cards.goToNextCard();
    return random_response('ask_answer')
      + " " + inQuotes( Cards.getCurrentQuestion() );
  },
  select_deck : function(){
    return "What deck would you like to study? \'" + Cards.getDeckSuggestion();
  },
  list_deck : function(){
    return random_response('acknowledge') + " Here are the decks you can study: " + Cards.getDecks();
  },
  welcome : function(){
    return random_response('welcome');
  },
  ask_deck : function(){
    return "What deck would you like to study today?";
  },
  good_job : function(){
    return random_response('encouragement');
  },

  getStats : function(deckName){

      let scoreRes = ScoreKeeper.getCorrectCount(deckName);
      let totalRes = ScoreKeeper.getTotalCount(deckName);

    return "You have answered " + scoreRes + " out of " + totalRes + " total questions in the " + deckName + " deck";
  },

  getBackTo : function(app){
    switch(app.getContext()){
      case ASSESS_CONTEXT:
          app.setContext(AGAIN_CONTEXT);
          return "Would you like to go back to your last card?";
      case AGAIN_CONTEXT:
          app.setContext(AGAIN_CONTEXT);
          return "Would you like to go back to your last card?";
      case HINT_CONTEXT:
          app.setContext(HINT_CONTEXT);
          return "So did you want to hear that hint?";
      case SWITCH_CONTEXT:
          app.setContext(SWITCH_CONTEXT);
          return "So what topic did you want to switch to?"
    }
    app.setContext(AGAIN_CONTEXT);
    return "Would you like to go back to your last card?";
  },

  skip : function(){
    var resp = random_response('acknowledge')
      + " " + random_response('skip')
      + " " + inQuotes( Cards.getCurrentQuestion() ) + "."
      + " " + random_response('give_answer')
      + " " + inQuotes( Cards.getCurrentAnswer() ) + ".";
    Cards.goToNextCard();
    return resp
      + " " + random_response('ask_answer')
      + " " + inQuotes( Cards.getCurrentQuestion() );
  },

  hint : function(){
    if ( Cards.getCurrentHint() ) {
      return random_response('hint')
        + " " + inQuotes( Cards.getCurrentHint() ) + "."
        + " " + random_response('re_ask');
    } else {
      return random_response('no_hint')
        + " " + random_response('repeat')
        + " " + inQuotes( Cards.getCurrentQuestion() );
    }
  },

  exit : function(){
    return "Thanks for studying with us! Have a great day!";
  }

}

var helpers = {
  encouragement: [
    'Right on!',
    'Great job!',
    'Great!',
    'Wonderful!',
    'Woohoo!',
    'You\'re doing great!',
    'Awesome job!'
  ],
  correct: [
    'is just right.',
    'is correct!',
    'is exactly right',
    'is spot on!'
  ],
  forward: [
    'Moving on ...',
    'Let\'s keep going!',
    'Onward!',
    'Now for the next one.'
  ],
  incorrect: [
    'is not quite right.',
    'is a little off.'
  ],
  try_again: [
    'Would you like to try again?',
    'Will you give it another shot?',
    'Want to give it another go?'
  ],
  acknowledge: [
    'Okay!',
    'Alright then.',
    'Swell!'
  ],
  give_answer: [
    'Here\'s the right answer: ',
    'Here\'s the correct answer: ',
    'The right answer is: ',
    'The correct answer is: '
  ],
  repeat: [
    'Here\'s the question again:',
    'I\'ll repeat the question for you:'
  ],
  ask_answer: [
    'Answer this: ',
    'Can you answer this? ',
    'Here\'s your question: '
  ],
  welcome: [
    'Welcome to Study Buddy! Let\'s go!',
    'Hi there! Let\'s get learning!'
  ],
  skip: [
    'We\'ll skip',
    'We\'ll move past',
    'We can skip'
  ],
  hint: [
    'Here\'s a hint:',
    'Maybe this will help:'
  ],
  re_ask: [
    'Any new ideas on the answer?',
    'What do you think the answer is?',
    'Any ideas?',
    'Do you have an answer?'
  ],
  no_hint: [
    'Oh no! It looks like I can\'t help you with this one.',
    'Drat, I don\'t have a hint for this one.',
    'Darn! I want to help you, but I don\'t have a hint for this question.'
  ]


}

function random_response(key){
  list = helpers[key];
  ceil = list.length;
  rand = Math.floor( Math.random() * ceil);
  return list[rand];
}

function inQuotes(string){
  return "\'"+string+"\'";
}

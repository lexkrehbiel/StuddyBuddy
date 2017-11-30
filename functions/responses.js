// module for cards
var Cards = require('./card_manager.js');
var ScoreKeeper = require('./score_keeper.js');

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
  give_options : function (){
    return random_response('options');
  },
  incorrect_give_answer : function (ans){
    return random_response('acknowledge')
      + " " + random_response('give_answer')
      + " " + inQuotes( Cards.getCurrentAnswer() ) + "."
      + " " + random_response('forward');
  },
  new_card : function(){
    Cards.goToNextCard();
    return random_response('ask_answer')
      + " " + inQuotes( Cards.getCurrentQuestion() );
  },
  select_deck : function(){
    return "What deck would you like to study? " + Cards.getDeckSuggestion();
  },
  list_deck : function(){
    return random_response('acknowledge') + " The available decks are: " + Cards.getDecks() + ". What would you like to study?";
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

    return "You have answered " + scoreRes + " out of " + totalRes + " total questions in the " + deckName + " deck.";
  },

  skip : function(){
    var resp = random_response('acknowledge')
      + " " + random_response('skip')
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
  },

  repeat : function(){
    return random_response('repeat')
      + " " + inQuotes( Cards.getCurrentQuestion() ) + ".";
  },

  acknowledge : function(){
    return random_response('acknowledge');
  },

  oops : function(){
    return random_response('misunderstood');
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
    'Let\'s give it another go.',
    'Go ahead and give it another shot.',
    'Why don\'t you try again.'
  ],
  acknowledge: [
    'Okay!',
    'Alright then.',
    'Will do, champ.'
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
    'We\'ll skip that one.',
    'We\'ll move past that one.',
    'We can skip it.'
  ],
  hint: [
    'Here\'s a hint:',
    'Maybe this will help:'
  ],
  re_ask: [
    'Any new ideas on the answer?',
    'What do you think the answer is?',
    'Any ideas?'
  ],
  no_hint: [
    'Oh no! It looks like I can\'t help you with this one.',
    'Drat, I don\'t have a hint for this one.',
    'Darn! I want to help you, but I don\'t have a hint for this question.'
  ],
  options: [
    'Don\'t forget, you can ask me for a hint, to skip a card, to repeat a card, or to say your score at any time.',
    'Just let me know if you want me to give you a hint, to move on, to repeat the question, or to give you your score.',
    'Whenever you need a hint, a repeat, a reminder of your score, or you want to move on, just tell me!',
    'Feel free to ask me for a hint, to repeat the question, to skip a question, or to tell you your score whenever you like.'
  ],
  misunderstood: [
    'Sorry, I didn\'t understand that.',
    'Hmm, I\'m not understanding you.',
    'Uh-oh! I don\'t know how to deal with what you said!',
    'Oops! I don\'t know what to do now. My bad!'
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

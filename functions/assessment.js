
var spawn = require("child_process").spawn;
var ratings = require("./constants.js").ratings;

// percentage agreements needed for each classification
const CORRECT = 1
const GOOD = .8
const ALMOST = .5

// promise to return the correctness value of the user answer
// compared to the correct answer
exports.rating = function(user_ans, correct_ans){

  return new Promise(function(resolve, reject){

    // spawn the python process
    var process = spawn('python',[__dirname + "/compare_keywords.py", user_ans, correct_ans]);

    // when the python process returns data,
    // return the classification for the given percent agreement
    process.stdout.on('data', function(data) {

      // classify the percentage, resolve the promise
      if ( data == CORRECT)
        resolve( ratings.CORRECT );

      else if ( data >= GOOD )
        resolve( ratings.GOOD );

      else if ( data >= ALMOST)
        resolve( ratings.ALMOST );

      else
        resolve (ratings.WRONG );
    });

  });
}

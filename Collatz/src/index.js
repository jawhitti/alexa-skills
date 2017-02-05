'use strict';

var Alexa = require("alexa-sdk");
var appId = ''; //'amzn1.echo-sdk-ams.app.your-skill-id';

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(collatzHandlers);
    alexa.execute();
};

var collatzHandlers = {

     'CollatzIntent': function () {
        var seed = parseInt(this.event.request.intent.slots.seed.value);
        console.log('user requested: ' + seed);

        if (!isNaN(seed)) {
            this.emit(':tell', collatz(seed) );
        } else {
            this.emit(':ask', 'Try saying a number.');
        }
    }
  };


function collatz(seed) {

   if(seed == 1) {
     return "One.";
   }

  var retval = "Start with " + seed + ". ";
   
    while(seed != 1) {
        
      if(seed % 2 === 0) {
          seed /= 2;
          retval = retval + "Divide by two to get " + seed + ". ";
      }
      else {
          seed = seed * 3 + 1;
          retval = retval + "Multiply by three and add one to get " + seed + ". ";
      }
   }   

 console.log(retval);
 return retval;

}



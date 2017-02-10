/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const Alexa = require('alexa-sdk');
var http = require('http');

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetAdvice');
    },
    
    'GetAdviceIntent': function () {
        var thisobj = this;
        
        getWeather(function(data) {
            console.log("HTTP get request complete.");
            
            var weather = JSON.parse(data);
            thisobj.emit(':tell', getAdvice(weather));
        });
    },
    
  
};


function getWeather(callback) {
           var options = {
          host: 'api.wunderground.com',
          path: '/api/4838fe769c819d8d/conditions/q/MO/Weldon_spring.json'
        };
    
          var cb = function(response) {
             var str = '';
            
              //another chunk of data has been recieved, so append it to `str`
             response.on('data', function (chunk) { str += chunk; });
        
              //the whole response has been recieved, so we just print it out here
              response.on('end', function () {
                 callback(str);
              });
        };

        http.get(options, cb);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getItem(collection) {
  return collection[getRandomInt(0, collection.length)];
}

function getFashionAdvice()
{
var greetings = ["I Suggest", "You should try", "How About", "You would look great in", "You know what I think?", "I've got it!", "They'll gasp when they see you coming in"];
var accessory_greetings = ["Finish the look with a ", "Top it off with a ", "Then knock them out with your ", "Kick up up a notch with that", "Bring it all together with a" ];
var adjectives =  ["blue", "red", "black", "orange", "white", "purple", "green", "yellow", "brown", "New", "vintage", "satin", "silk", "leather",
                 "baggy", "flowery", "wrinkled", "smelly", "fresh", "slim-fit", "sheer", "demim", "plaid"];
var tops = [ "t-shirt", "old sweater", "concert shirt", "hoodie", "Blues Jersey", "Polo shirt", "Pullover", "vest"];
var bottoms = ["pair of jeans", "skirt", "pair of shorts", "pair of tights"];
var accessories = ["pair of earrings", "choker", "fedora", "trucker hat", "Baseball Hat", "bunch of bracelets", "few necklaces", "necktie"];

  return getItem(greetings) + " a " +
         getItem(adjectives) + " " +
         getItem(adjectives) + " " +
         getItem(tops) + ", and a " +
         getItem(adjectives) + " " +
         getItem(adjectives) + "  " +
         getItem(bottoms) + ". " +
         getItem(accessory_greetings)  +
         getItem(adjectives) + " " +
         getItem(accessories) + ". ";
}

function getAdvice(weather) {
    var temp = weather.current_observation.temp_f;
    
    var advice = getFashionAdvice();
    if(temp < 10)
        advice += 'It is FREEZING out there today!  Also bring a heavy coat, scarf, gloves and a hat!';
    else if(temp < 32)
        advice += 'It is cold out today. Wear a coat and a hat';
    else if(temp < 60)
        advice += 'It is chilly today. Bring a jacket';
    else if(temp < 90)
        advice += 'It is a nice warm day today. Perfect for showing your style. ';
    else if(temp > 90)
        advice += 'It is hot out there, so dress cool.';
    else if(temp > 100)
        advice += 'It is scorching out there today!  Be sure to drink plenty of water.';
      
      
     var closings = ["You better hurry; the bus is coming!", "Have a great day.", "See you after school.", "You're going to look great"];
     advice +=  getItem(closings) + ".";
   
    return advice;
}


exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};


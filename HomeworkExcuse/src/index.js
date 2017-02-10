'use strict';

const Alexa = require('alexa-sdk');


exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetExcuse');
    },
    'GetExcuseIntent': function () {
        this.emit('GetExcuse');
    },
    'GetExcuse': function () {

        // Create speech output
        this.emit(":tell", getExcuse());
    },
};


function getExcuse() {
    
    const prefixes = [ "Maybe you could say ",
                       "How about ",
                       "You could try ",
                       "Oh, I've got one! ",
                       "This one never fails: "];
    
    const excuses = [ 
        "'My dog ate it.'",
        "'Ninjas attacked me on my way to school.'",
        "'My dad locked me in the closet.'",
        "'I spilled Soda all over it.'",
        "'It flew out the window of the bus on the way to school.'"
    ];
    var idx1  = Math.floor(Math.random() * prefixes.length);
    var idx2  = Math.floor(Math.random() * excuses.length);
    return prefixes[idx1] + excuses[idx2];
}

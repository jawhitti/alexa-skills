/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

'use strict';

const Alexa = require('alexa-sdk');
var http = require('http');

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetBulletin');
    },
    'GetBulletinIntent': function () {
        this.emit('GetBulletin');
    },
    'DoIHaveSchoolIntent': function () {
        this.emit(":tell", doIHaveSchoolToday());
    },
    'GetBulletin': function () {
      var thisobj = this;
      getBulletin(function(html) {  thisobj.emit(':tell', getBulletinText(html)); });

    },
//    'AMAZON.HelpIntent': function () {
//        const speechOutput = this.t('HELP_MESSAGE');
//        const reprompt = this.t('HELP_MESSAGE');
//        this.emit(':ask', speechOutput, reprompt);
//    },
//    'AMAZON.CancelIntent': function () {
//        this.emit(':tell', this.t('STOP_MESSAGE'));
//    },
//    'AMAZON.StopIntent': function () {
//        this.emit(':tell', this.t('STOP_MESSAGE'));
//    },
//    'SessionEndedRequest': function () {
//        this.emit(':tell', this.t('STOP_MESSAGE'));
//    },
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};


////////////////////////////////////////

function getBulletin(callback) {
           var options = {
          host: 'fhsdbryan.sharpschool.net',
          path: '/news/daily_announcements'
        };
    
          var cb = function(response) {
             var str = '';
            
              //another chunk of data has been recieved, so append it to `str`
             response.on('data', function (chunk) { str += chunk; });
        
              //the whole response has been received, so we just print it out here
              response.on('end', function () {
                 callback(str);
              });
        };

        http.get(options, cb);
}


function processTitle(match) {
  var s = match;
  s = s.replace('**', '').replace('<br>','');
  s = s.replace('</span>', ''),
  
  s = s.split('</span>').join(''),
  s = s.split('&cent;').join(' cents');
  s = s.split('&nbsp;').join(' ');
  s = s.split('&mdash;').join('-');
  s = s.split('&rsquo;').join('\'');
  s = s.split('&quote;').join('\"');
  s = s + ". ";
  //s = '<p>' + s + '</p>';

//  console.log(s);
  return s;
}


function processText(match) {
  var s = match;
  s = s.replace('**', '').replace('<br>','');
  s = s.split('</span>').join(''),
  s = s.split('&cent;').join(' cents');
  s = s.split('&nbsp;').join(' ');
  s = s.split('&mdash;').join('-');
  s = s.split('&rsquo;').join('\'');
  s = s.split('&quote;').join('\"');
  s = s + ". ";

  s = s + ' ';
  //s = '<p>' + s + '</p>';
  console.log(s);
  
  return s;
}

function getBulletinText(str) {
    var titlere = new RegExp('BRYAN STUDENT ANNOUNCEMENTS.*?&mdash;(.*?)</span>');
    var title = str.match(titlere);
    var speech = processTitle(title[0]);
    
    var re = new RegExp('[*][*]\s*?(.*?)<br>', 'g');
    var matches = str.match(re);

    matches.forEach(function(match) { 
       speech += processText(match); 
     });
     
     console.log("final speech text:" + speech);
     return speech;
}

function doIHaveSchoolToday() {
    var now = new Date();
    console.log("now is " + now);
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    
    
    var greetings = new Map();
    greetings.set("noSchool", "No.");
    greetings.set("earlyRelease", "Yes.");
    greetings.set("normal", "Yes.");
    
    var info = getAttendanceInfo(now);
    return greetings.get(info.attendance) + " Today is " + info.name + '.';
    
}

function getAttendanceInfo(date)
{
    var specialDays = new Map();
    specialDays.set(new Date(2017,1,17), {attendance:"noSchool", name: "a teacher development day"} );
    specialDays.set(new Date(2017,1,20), {attendance:"noSchool", name: "President's day"} );
    specialDays.set(new Date(2017,2,20), {attendance:"noSchool", name: "Spring Break"} );
    specialDays.set(new Date(2017,2,21), {attendance:"noSchool", name: "Spring Break"} );
    specialDays.set(new Date(2017,2,22), {attendance:"noSchool", name: "Spring Break"} );
    specialDays.set(new Date(2017,2,23), {attendance:"noSchool", name: "Spring Break"} );
    specialDays.set(new Date(2017,2,24), {attendance:"noSchool", name: "Spring Break"} );
    specialDays.set(new Date(2017,3,14), {attendance:"noSchool", name: "Good Friday"} );
    specialDays.set(new Date(2017,3,17), {attendance:"noSchool", name: "a teacher development day"} );
    specialDays.set(new Date(2017,4,16), {attendance:"earlyRelease", name: "an early release day"} );
    specialDays.set(new Date(2017,4,17), {attendance:"earlyRelease", name: "the last day of school"} );

    var lastDayOfSchool = new Date(2017,4,17);
    if (date > lastDayOfSchool) {
        console.log("Summer Vacation");
        return { attendance:"noSchool", name:"summer vacation" };
    }

    else if(date in specialDays) {
        console.log("special date");
        console.log(specialDays[date]);
        return specialDays[date];
    }

    else {
        var day = date.getDay();
    
        if(day === 0 || day == 6 ) {
            console.log("weekend");
            return { attendance:"noSchool", name:"a weekend day" };
        }
        else 
            console.log("normal");
            return { attendance:"normal", name:"a school day" };
    }
    
    return { attendance:"error", name:"error" };
}








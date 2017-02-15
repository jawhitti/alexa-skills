/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

'use strict';

const Alexa = require('alexa-sdk');
var http = require('http');

const handlers = {
    'LaunchRequest': function () {
        console.log("LaunchRequest");
        this.emit(":ask", "How can I assist you?");
    },
    'GetBulletinIntent': function () {
      console.log("GetBulletinIntent");
        this.emit('GetBulletin');
    },
    'QueryLunchIntent': function () {
      console.log("QueryLunchIntent");
      var desiredDate = this.event.request.intent.slots.date.value;
      console.log("incoming date field is " + desiredDate);
      this.emit(':tell', queryLunch(desiredDate));
    },
    'QueryBreakfastIntent': function () {
      console.log("QueryBreakfastIntent");
      var thisobj = this;
      getBulletinHtml(function(html) {  thisobj.emit(':tell', getBulletinText(html, false,  item => item.includes("breakfast menu") )); });
    },
    'QueryActivityIntent' : function() { 
      var thisobj = this;
      var activity = this.event.request.intent.slots.activity.value;
      getBulletinHtml(function(html) {  thisobj.emit(':tell', getActivityText(html, activity.toLowerCase())); });
    },
    
    'DoIHaveSchoolIntent': function () {
        var desiredDate = this.event.request.intent.slots.date.value;
        this.emit(":tell", doIHaveSchoolOn(desiredDate));
    },

    'GetBulletin': function () {
      var thisobj = this;
      getBulletinHtml(function(html) {  thisobj.emit(':tell', getBulletinText(html, true, item => true )); });

    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = "Try asking questions like 'What's for lunch tomorrow?' or 'Do I have basketball today?'";
        const reprompt = speechOutput;
        this.emit(':ask', speechOutput, reprompt);
    },
//    'AMAZON.CancelIntent': function () {
//        this.emit(':tell', this.t('STOP_MESSAGE'));
//    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', "Ok. Have a great day!");
    },
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

function getBulletinHtml(callback) {
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


function sanitize(match) {
  var s = match;
  s = s.replace('**', '').replace('<br>','');
  s = s.split('</span>').join(''),
  s = s.split('&cent;').join(' cents');
  s = s.split('&nbsp;').join(' ');
  s = s.split('&ndash;').join('-');
  s = s.split('&mdash;').join('-');
  s = s.split('&lsquo;').join('\'');
  s = s.split('&rsquo;').join('\'');
  s = s.split('&ldquo;').join('\'');
  s = s.split('&rdquo;').join('\'');
  s = s.split('&quote;').join('\"');
  //s = '<p>' + s + '</p>';

//  console.log(s);
  return s;
}

function getBulletinText(str, includeTitle, selector) {
    var speech = '';
    
    if(includeTitle)
        speech += getBulletinTitle(str);
        
        
    var items = getBulletinItems(str);

    items.forEach(function(item) { 
        console.log("calling selector for '" + item + "'");
        if(selector(item)) {
          console.log("selector returned true");
          speech += item; 
          speech += ' ';
        }
     });
     
     console.log("final speech text:" + speech);
     return speech;
}

function getActivityText(str, activity) {
    var speech = '';
    
    var items = getBulletinItems(str);

    items.forEach(function(item) { 
        if(item.toLowerCase().includes(activity)) {
          console.log(activity + "found in " + item);
          speech += item; 
          speech += ' ';
        }
        else {
          console.log(activity + "not found in " + item);

        }
     });
     
     if(speech.length === 0) {
         speech = activity + " is not mentioned in today's bulletin.";
     }
     
     console.log("final speech text:" + speech);
     return speech;
}

function getBulletinTitle(str) {
    var regex = new RegExp('BRYAN STUDENT ANNOUNCEMENTS.*?&mdash;(.*?)</span>');
    var title = str.match(regex);
    var retval =  sanitize(title[0]);
    retval = "<p>" + retval + ".</p>";
    console.log("title:" + retval);
    return retval;
}

function getBulletinItems(str) {

    var retval = [];
   
    var regex = new RegExp('[*][*]\s*?(.*?)<br>', 'g');
    var matches = str.match(regex);

    matches.forEach(function(match) { 
       var text = sanitize(match);
       retval.push(text); 
     });
     
     console.log(retval.length + " bulletin items found");
     return retval;
}

/*function doIHaveSchoolToday() {
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
}*/

function doIHaveSchoolOn(date) {

    var greetings = new Map();
    greetings.set("noSchool", "No.");
    greetings.set("earlyRelease", "Yes.");
    greetings.set("normal", "Yes.");
    
    var info = getAttendanceInfo(date);
    return greetings.get(info.attendance) + " It will be " + info.name + '.';
    
    //TODO put a happy or sad interjection here as appropriate
}

function getAttendanceInfo(date)
{
    var specialDays = {
    "2017-02-17" : {attendance:"noSchool", name: "a teacher development day"},
    "2017-02-20" : {attendance:"noSchool", name: "President's day"},
    "2017-03-20" : {attendance:"noSchool", name: "Spring Break"},
    "2017-03-21" : {attendance:"noSchool", name: "Spring Break"},
    "2017-03-22" : {attendance:"noSchool", name: "Spring Break"},
    "2017-03-23" : {attendance:"noSchool", name: "Spring Break"},
    "2017-03-24" : {attendance:"noSchool", name: "Spring Break"},
    "2017-04-14" : {attendance:"noSchool", name: "Good Friday"},
    "2017-04-17" : {attendance:"noSchool", name: "a teacher development day"},
    "2017-05-16" : {attendance:"earlyRelease", name: "an early release day"},
    "2017-05-17" : {attendance:"earlyRelease", name: "the last day of school!"}
    };

    var lastDayOfSchool = new Date(2017,4,17);
    if (new Date(date) > lastDayOfSchool) {
        console.log("Summer Vacation");
        return { attendance:"noSchool", name:"summer vacation" };
    }

    else if(date in specialDays) {
        console.log("special date");
        console.log(specialDays[date]);
        return specialDays[date];
    }

    else {
        var dateObject = new Date(date);
        var day = dateObject.getDay();
    
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


function querySchoolAddress() {
    return "605 Independence Road, St. Charles, Missourin, 63304";
}

function querySchoolPhoneNumber() {
    return  "636-851-5800";
}


//the date passed here should be an Amazon date as described at 
//https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/built-in-intent-ref/slot-type-reference#date
function queryLunch(desiredDate) {
    
    // menu laboriously transcribed from 
    // http://www.fhsdschools.org/departments/food_services/meal_menus
    // It will need to be periodically updated.
    
    var menu = {
       "2017-02-13" : "Down Home Chicken Bowl and Roasted Carrots.",
       "2017-02-14" : "Nuclear Meltdown Burrito and Baked Beans.",
       "2017-02-15" : "Spicy Chicken Wrap and Roasted Sweet Potatoes.",
       "2017-02-16" : "Sweet and Sour Chicken with Rice and Steamed Broccoli.",
       "2017-02-17" : "No School",
       "2017-02-18" : "No School",
       "2017-02-19" : "No School",
       "2017-02-20" : "No School",
       "2017-02-21" : "General Tso Chicken with Rice and Steamed Broccoli.",
       "2017-02-22" : "Chicken Fajita Bowl and Refried Beans.",
       "2017-02-23" : "Patty Melt and Cajun Sweet Potato Tots.",
       "2017-02-24" : "Chicken and Waffles with Corn.",
       "2017-02-25" : "No School",
       "2017-02-26" : "No School",
       "2017-02-27" : "Spicy Popcorn Chicken and Black Beans with Corn.",
       "2017-02-28" : "Chicken and Cheese Quesadilla and Cajun Sweet Potato Fries.",
       "2017-03-01" : "Grilled Cheese with Tomato Soup and Roasted Carrots.",
       "2017-03-02" : "Beef Fajitas and Broccoli with Cheese Sauce.",
       "2017-03-03" : "Spicy Chicken Wrap and Corn.",
   };
   
   var commentary = [
        //https://developer.amazon.com/blogs/post/036350a8-8295-4f11-80c6-397873e2847f/new-alexa-skills-kit-ask-feature-ssml-speechcons-in-alexa-skills
       "<say-as interpret-as='interjection'>bam</say-as>",
       "<say-as interpret-as='interjection'>bazinga</say-as>",
       "<say-as interpret-as='interjection'>alrighty</say-as>",
       "<say-as interpret-as='interjection'>blah</say-as>",
       "<say-as interpret-as='interjection'>bon appetit</say-as>",
       "<say-as interpret-as='interjection'>booya</say-as>",
       "<say-as interpret-as='interjection'>bummer</say-as>",
       "<say-as interpret-as='interjection'>cha ching</say-as>",
       "<say-as interpret-as='interjection'>d'oh</say-as>",
       "<say-as interpret-as='interjection'>dynomite</say-as>",
       "<say-as interpret-as='interjection'>hiss</say-as>",
       "<say-as interpret-as='interjection'>hurrah</say-as>",
       "<say-as interpret-as='interjection'>huzzah</say-as>",
       "<say-as interpret-as='interjection'>kapow</say-as>",
       "<say-as interpret-as='interjection'>kaching</say-as>",
       "<say-as interpret-as='interjection'>le sigh</say-as>",
       "<say-as interpret-as='interjection'>no way</say-as>",
       "<say-as interpret-as='interjection'>oh my</say-as>",
       "<say-as interpret-as='interjection'>squee</say-as>",
       "<say-as interpret-as='interjection'>touche</say-as>",
       "<say-as interpret-as='interjection'>voila</say-as>",
       "<say-as interpret-as='interjection'>wahoo</say-as>",
       "<say-as interpret-as='interjection'>well well</say-as>",
        "<say-as interpret-as='interjection'>whee</say-as>",
       "<say-as interpret-as='interjection'>woo hoo</say-as>",
       "<say-as interpret-as='interjection'>yay</say-as>",
       "<say-as interpret-as='interjection'>yikes</say-as>",
       "<say-as interpret-as='interjection'>yippe</say-as>",
       "<say-as interpret-as='interjection'>yowzer</say-as>",
       "<say-as interpret-as='interjection'>yuck</say-as>",
       "<say-as interpret-as='interjection'>yum</say-as>",
       "<say-as interpret-as='interjection'>voila</say-as>",
   ]
   
    var retval = null;
    var index = desiredDate;

    if(index in menu) {
    var menuItem = menu[index];
        if(menuItem == "No School") {
            retval = "There is no school that day.";
        }
        else {
            retval = menuItem;
            
            if((Math.random() * 100) < 100)
            {
                var commentaryIndex = Math.floor(Math.random() * commentary.length);
                retval = retval + ' ' + commentary[commentaryIndex];
            }
        }
    }
    else {
            retval = "I'm sorry, I can't find that information.";
    }

    console.log("final speech output: '" + retval + "'"); 
    return retval;
}


 

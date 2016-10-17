// var Settings = require('settings');

var serverUrl = 'https://maker.ifttt.com/trigger/';
var keyPrefix = '/with/key/';

// // Set a configurable with the open callback
// Settings.config(
//   { url: 'http://amcolash.github.io/IoT-Buddy/index.html?'  +
//    encodeURIComponent(JSON.stringify(Settings.option())), autoSave: true },
//   function(e) {
//     console.log('opening configurable');
//     console.log(JSON.stringify(Settings.option()));
//   },
//   function(e) {
//     console.log('closed configurable');
//     console.log(JSON.stringify(e));
// //     refreshMenu();
//   }
// );

Pebble.addEventListener('showConfiguration', function() {
  console.log("OPEN!");
  var url = 'http://amcolash.github.io/IoT-Buddy/index.html?';
  Pebble.openURL(url);
});

Pebble.addEventListener('webviewclosed', function(e) {
  // Decode the user's preferences
  var configData = JSON.parse(decodeURIComponent(e.response));
  console.log(JSON.stringify(configData));
  
  // Send to the watchapp via AppMessage
  var dict = {
    'BackgroundColor': configData.backgroundColor,
    'ForegroundColor': configData.textColor,
    'BackgroundTextColor': configData.highlightBackgroundColor,
    'ForegroundTextColor': configData.highlightTextColor,
    'Key': configData.key,
  };
  
  // Send to the watchapp
  Pebble.sendAppMessage(dict, function() {
    console.log('Config data sent successfully!');
  }, function(e) {
    console.log('Error sending config data!');
  });
  
});


var xhrRequest = function (url, type, json, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  
  xhr.open(type, url);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify(json));
};

Pebble.addEventListener('ready', function() {
  // PebbleKit JS is ready!
  console.log('PebbleKit JS ready!');
});

// Get AppMessage events
Pebble.addEventListener('appmessage', function(e) {
  // Get the dictionary from the message
  var dict = e.payload;

//   console.log('Got message: ' + JSON.stringify(dict));
  
  if (typeof dict.TriggerName !== 'undefined' &&
    typeof dict.TriggerTrigger !== 'undefined' &&
    typeof dict.TriggerValue !== 'undefined') {
    
    // The RequestData key is present, read the value
    var name = dict.TriggerName;
    var trigger = dict.TriggerTrigger;
    var value = dict.TriggerValue;
    var key = dict.Key;
    
    console.log("TriggerName: ", name);
    console.log("TriggerTrigger: " + trigger);
    console.log("TriggerValue: " + value);

    xhrRequest(serverUrl + trigger + keyPrefix + key, 'PUT', {"value1" : value},
      function(responseText) {
        console.log(responseText);
      }
    );
  }
});

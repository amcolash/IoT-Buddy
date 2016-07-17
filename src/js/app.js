var Clay = require('pebble-clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig);

var serverUrl = 'https://maker.ifttt.com/trigger/';
var keyPrefix = '/with/key/';
var key = 'cJ1XbEafEDq1fMb4m8SLtk';

var settings = {};
var menu = [];

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
  
  settings = localStorage['clay-settings'];
  
  menu = [
    {
      name: "Name 1",
      trigger: "Trigger 1",
      value: "Value 1"
    },
    {
      name: "Name 2",
      trigger: "Trigger 2",
      value: "Value 2"
    },
    {
      name: "Name 3",
      trigger: "Trigger 3",
      value: "Value 3"
    },
  ];
    
  console.log(settings);
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
    
    console.log("TriggerName: ", name);
    console.log("TriggerTrigger: " + trigger);
    console.log("TriggerValue: " + value);

//     console.log(settings);
    
//     var trigger = menu[req].trigger;
//     var value = menu[req].value;
    
//     console.log("trigger: ", trigger);
//     console.log("value: ", value);

    xhrRequest(serverUrl + trigger + keyPrefix + key, 'PUT', {"value1" : value},
      function(responseText) {
      console.log(responseText);
      }
    );
  }
});

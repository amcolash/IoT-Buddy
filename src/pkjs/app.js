var MessageQueue = require('./js-message-queue');

var serverUrl = 'https://maker.ifttt.com/trigger/';
var keyPrefix = '/with/key/';

Pebble.addEventListener('showConfiguration', function() {
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
  send_message(dict);
  
  for (var i = 0; i < configData.triggers.length; i++) {
    var trigger_dict = {
      'TriggerName': configData.triggers[i].trigger_name,
      'TriggerEvent': configData.triggers[i].trigger_event,
      'TriggerValue': configData.triggers[i].trigger_value,
      'TriggerIndex': i
    };
    
    send_message(trigger_dict);
  }
  
});

// TODO: Fix this, get a working message queue
function send_message(dictionary) {
  MessageQueue.sendAppMessage(dictionary, function() {
    console.log('Config data sent successfully!');
  }, function(e) {
    console.log('Error sending config data!\n' + JSON.stringify(dictionary));
  });
}

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
    typeof dict.TriggerEvent !== 'undefined' &&
    typeof dict.TriggerValue !== 'undefined') {
    
    // The RequestData key is present, read the value
//     var name = dict.TriggerName;
    var trigger = dict.TriggerEvent;
    var value = dict.TriggerValue;
    var key = dict.Key;
    
//     console.log("TriggerName: ", name);
//     console.log("TriggerTrigger: " + trigger);
//     console.log("TriggerValue: " + value);

    xhrRequest(serverUrl + trigger + keyPrefix + key, 'PUT', {"value1" : value},
      function(responseText) {
        console.log(responseText);
      }
    );
  }
  
  if (typeof dict.Settings !== 'undefined') {
    console.log(JSON.stringify(dict.Settings));
  }
});

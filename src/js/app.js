var Clay = require('pebble-clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig);

var serverUrl = 'https://maker.ifttt.com/trigger/';
var keyPrefix = '/with/key/';
var key = 'cJ1XbEafEDq1fMb4m8SLtk';

var xhrRequest = function (url, type, json, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.open(type, url);
  xhr.send(JSON.stringify(json));
};

Pebble.addEventListener('ready', function() {
  // PebbleKit JS is ready!
  console.log('PebbleKit JS ready!');

  // console.log(clay.getSettings());
});

// Get AppMessage events
Pebble.addEventListener('appmessage', function(e) {
  // Get the dictionary from the message
  var dict = e.payload;

  console.log('Got message: ' + JSON.stringify(dict));
  if (typeof dict.RequestData !== 'undefined') {
    // The RequestData key is present, read the value
    var value = dict.RequestData;
    console.log(value);

    var trigger = "test";
    var val = "test";

    xhrRequest(serverUrl + trigger + keyPrefix + key, 'PUT', {"value1" : val},
      function(responseText) {
        console.log(responseText);
      }
    );
//     ajax({
//       url: ,
//       method: 'put',
//       type: 'json',
//       data: {"value1": val}
//     }, function(response) {
//       console.log(response);
//     });
  }
});

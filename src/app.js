var UI = require('ui');
var ajax = require('ajax');
var Settings = require('settings');

var serverUrl = 'https://maker.ifttt.com/trigger/';
var keyPrefix = '/with/key/';
var key = 'QW9btRcieq0Z83x0Z7tRQ';

// Set a configurable with the open callback
Settings.config(
  { url: 'http://pi.amcolash.com/pebbleiot/index.html' },
  function(e) {
    console.log('opening configurable');
  },
  function(e) {
    console.log('closed configurable');
    console.log(JSON.stringify(e));
  }
);

var triggers = Settings.option('triggers');
// Create the Menu, supplying the list of fruits

if (triggers !== null && triggers.length !== 0) {
  var triggerMenu = new UI.Menu({
    sections: [{
      title: 'Trigger List',
      items: triggers
    }]
  });
  
  // Show the Menu
  triggerMenu.show();
  
  // Add a click listener for select button click
  triggerMenu.on('select', function(event) {
    ajax({
      url: serverUrl + triggers[event.itemIndex].trigger + keyPrefix + key,
      method: 'put'
    });
  });
} else {
  var card = new UI.Card({
    title: 'Set up app',
    body: 'You need to set up PebbleIoT from your phone.'
  });
  
  card.show();
}
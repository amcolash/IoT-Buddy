var UI = require('ui');
var ajax = require('ajax');
var Settings = require('settings');

var serverUrl = 'https://maker.ifttt.com/trigger/';
var keyPrefix = '/with/key/';
var key;

// Set a configurable with the open callback
Settings.config(
  { url: 'http://pi.amcolash.com/pebbleiot/index.html?' +
   encodeURIComponent(JSON.stringify(Settings.option())), autoSave: true },
  function(e) {
    console.log('opening configurable');
  },
  function(e) {
    console.log('closed configurable');
    console.log(JSON.stringify(e));
    refreshMenu();
  }
);

refreshMenu();

function refreshMenu() {
  var triggers = Settings.option('triggers');
  key = Settings.option('key');
  var menuItems = [];
  if (triggers !== null) {
    for (var i = 0; i < triggers.length; i++) {
      menuItems.push({'title': triggers[i].trigger_name, 'subtitle': triggers[i].trigger_event});
    }
  }
  
  if (menuItems.length > 0 && key !== '') {
    var triggerMenu = new UI.Menu({
      sections: [{
        title: 'Trigger List',
        items: menuItems
      }]
    });
    
    // Show the Menu
    triggerMenu.show();
    
    // Add a click listener for select button click
    triggerMenu.on('select', function(event) {
      ajax({
        url: serverUrl + menuItems[event.itemIndex].subtitle + keyPrefix + key,
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
}
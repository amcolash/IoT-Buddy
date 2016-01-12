var UI = require('ui');
var ajax = require('ajax');
var Settings = require('settings');

var serverUrl = 'https://maker.ifttt.com/trigger/';
var keyPrefix = '/with/key/';
var key;

var triggerMenu;
var card;

// Set a configurable with the open callback
Settings.config(
  { url: 'http://pi.amcolash.com/pebbleiot/index.html?'  +
   encodeURIComponent(JSON.stringify(Settings.option())), autoSave: true },
  function(e) {
    console.log('opening configurable');
    console.log(JSON.stringify(Settings.option()));
  },
  function(e) {
    console.log('closed configurable');
    console.log(JSON.stringify(e));
    refreshMenu();
  }
);

refreshMenu();

function refreshMenu() {
  // Remove old menus
  if (triggerMenu !== null && triggerMenu !== undefined) {
    triggerMenu.hide();
  }
  if (card !== null && card !== undefined) {
    card.hide();
  }
  
  var triggers = Settings.option('triggers');
  key = Settings.option('key');
  var menuItems = [];
  if (triggers !== null && triggers instanceof Array) {
    // Parse options and turn it into a list of menu items
    for (var i = 0; i < triggers.length; i++) {
      menuItems.push({'title': triggers[i].trigger_name, 'subtitle': triggers[i].trigger_event});
    }
  }
  
  if (menuItems.length > 0 && key !== '') {
    triggerMenu = new UI.Menu({
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
    card = new UI.Card({
      title: 'Set up app',
      body: 'You need to set up IoT Buddy from your phone.'
    });
    
    card.show();
  }
}
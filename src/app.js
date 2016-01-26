var UI = require('ui');
var ajax = require('ajax');
var Settings = require('settings');
var Vibe = require('ui/vibe');

var serverUrl = 'https://maker.ifttt.com/trigger/';
var keyPrefix = '/with/key/';
var key;

var triggerMenu;
var card;

var started = false;
var color = true;

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

// Seems to work better for iOS?
if (!started) {
  refreshMenu();
  color = Pebble.getActiveWatchInfo().platform !== 'aplite';
}

// Both shouldn't fire
Pebble.addEventListener('ready', function(e) {
  if (!started) {
    refreshMenu();
  }
});
                        
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
      }],
    });
    
    if (color) {
      var backgroundColor = Settings.option('backgroundColor');
      var highlightBackgroundColor = Settings.option('highlightBackgroundColor');
      var textColor = Settings.option('textColor');
      var highlightTextColor = Settings.option('highlightTextColor');
      
      triggerMenu.backgroundColor = backgroundColor || 'white';
      triggerMenu.highlightBackgroundColor = highlightBackgroundColor || 'black';
      triggerMenu.textColor = textColor || 'black';
      triggerMenu.highlightTextColor = highlightTextColor || 'white';
    }
    
    // Show the Menu
    console.log('Showing main menu');
    triggerMenu.show();
    
    // Add a click listener for select button click
    triggerMenu.on('select', function(event) {
      Vibe.vibrate('short');
      ajax({
        url: serverUrl + menuItems[event.itemIndex].subtitle + keyPrefix + key,
        method: 'put'
      });
    });
  } else {
    console.log('Setup Required');
    
    card = new UI.Card({
      title: 'Set up app',
      body: 'You need to set up IoT Buddy from your phone.'
    });
    
    card.show();
  }
}
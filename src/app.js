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

var timer; // timer object to clear ui changes (settings / activations)
var timeout = 10; // timeout before closing app, unit is minutes

// Set a configurable with the open callback
Settings.config(
  { url: 'http://amcolash.github.io/IoT-Buddy/index.html?'  +
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
  started = true;
  refreshMenu();
}

// Both shouldn't fire
Pebble.addEventListener('ready', function(e) {
  if (!started) {
    started = true;
    refreshMenu();
  }
});
                        
function refreshMenu() {
  color = Pebble.getActiveWatchInfo().platform !== 'aplite';
  
  // Reset timeout and set a new one
  clearTimeout(timer);
  
  timer = setTimeout(function() {
    triggerMenu.hide();
  }, timeout * 60000);
  
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
  console.log(triggers);
  if (triggers !== null && triggers instanceof Array) {
    // Parse options and turn it into a list of menu items
    for (var i = 0; i < triggers.length; i++) {
      menuItems.push({'title': triggers[i].trigger_name, 'subtitle': triggers[i].trigger_event,
                      'value': triggers[i].trigger_value});
    }
  }
  
  if (menuItems.length > 0 && key !== '') {
    
    var backgroundColor = color ? Settings.option('backgroundColor') : 'white';
    var highlightBackgroundColor = color ? Settings.option('highlightBackgroundColor') : 'black';
    var textColor = color ? Settings.option('textColor') : 'black';
    var highlightTextColor = color ? Settings.option('highlightTextColor') : 'white';
    
    if (backgroundColor !== undefined) backgroundColor = backgroundColor.replace('0x', '#');
    if (highlightBackgroundColor !== undefined) highlightBackgroundColor = highlightBackgroundColor.replace('0x', '#');
    if (textColor !== undefined) textColor = textColor.replace('0x', '#');
    if (highlightTextColor !== undefined) highlightTextColor = highlightTextColor.replace('0x', '#');
    
    console.log(backgroundColor);
    console.log(highlightBackgroundColor);
    console.log(textColor);
    console.log(highlightTextColor);
    
    triggerMenu = new UI.Menu({
      sections: [{
        title: 'Trigger List',
        items: menuItems
      }],
      backgroundColor: backgroundColor,
      highlightBackgroundColor: highlightBackgroundColor,
      textColor: textColor,
      highlightTextColor: highlightTextColor,
      status: {
        color: textColor,
        backgroundColor: backgroundColor,
//         separator: 'none',
      }
    });
    
    // Show the Menu
    console.log('Showing main menu');
    triggerMenu.show();
    
    // Add a click listener for select button click
    triggerMenu.on('select', function(event) {
      Vibe.vibrate('short');
      
      // Clear timer and set a new one
      clearTimeout(timer);
      timer = setTimeout(function() {
        triggerMenu.hide();
      }, timeout * 60000);
      ajax({
        url: serverUrl + menuItems[event.itemIndex].subtitle + keyPrefix + key,
        method: 'put',
        type: 'json',
        data: {"value1": menuItems[event.itemIndex].value},
      }, function(data) {
          console.log(data);
      });
    });
  } else {
    console.log('Setup Required');
    
    card = new UI.Card({
      title: 'Set up app',
      body: 'You need to set up IoT Buddy from your phone.'
    });
    
    card.show();
    
    timer = setTimeout(function() {
      card.hide();
    }, timeout * 60000);
  }
}
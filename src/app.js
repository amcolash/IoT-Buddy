
var UI = require('ui');
var ajax = require('ajax');

var serverUrl = 'https://maker.ifttt.com/trigger/';
var keyPrefix = '/with/key/';
var key = 'QW9btRcieq0Z83x0Z7tRQ';

// Make a list of menu items
var triggers = [
  {
    title: 'Toggle Lights',
    trigger: 'toggle_lights'
  },
  {
    title: 'Toggle Lamp',
    trigger: 'toggle_lamp'
  }
];

// Create the Menu, supplying the list of fruits
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
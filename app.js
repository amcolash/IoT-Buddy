var options = {'triggers': [], 'key': ''};

function remove() {
  $('.remove').unbind('click');

  $('.remove').click(function() {
    $(this).parent().remove();

    if ($('.item-draggable-list label').length === 0) {
      $('.item-draggable-list').append(
        '<span class="item empty">Trigger List Empty</span>'
      );
    }
  });
}

function add(trigger_name, trigger_event, trigger_value) {
  var value = '';
  if (trigger_value !== '' && trigger_value !== undefined) {
    value = ' (' + trigger_value + ')';
  }
  var item = $(
    '<label class="item">' + trigger_name + ' - ' + trigger_event + value +
      '<span class="remove">X</span>' +
      '<div class="item-draggable-handle">' +
        '<div class="item-draggable-handle-bar"></div>' +
        '<div class="item-draggable-handle-bar"></div>' +
        '<div class="item-draggable-handle-bar"></div>' +
      '</div>' +
    '</label>'
  ).appendTo('.item-draggable-list');

  item.data('trigger_name', trigger_name);
  item.data('trigger_event', trigger_event);

  if (trigger_value === undefined || trigger_value === null) {
    trigger_value = '';
  }
  item.data('trigger_value', trigger_value);

  $('.empty').remove();

  remove();
}

function save() {
  var key = $('input[name="key"]').val();

  var textColor = $('input[name="textColor"]').val();
  var backgroundColor = $('input[name="backgroundColor"]').val();
  var highlightTextColor = $('input[name="highlightTextColor"]').val();
  var highlightBackgroundColor = $('input[name="highlightBackgroundColor"]').val();

  options = {
    'triggers': [],
    'key': key,
    'textColor': parseInt(textColor, 16),
    'backgroundColor': parseInt(backgroundColor, 16),
    'highlightTextColor': parseInt(highlightTextColor, 16),
    'highlightBackgroundColor': parseInt(highlightBackgroundColor, 16)
  };

  if ($('.item-draggable-list label').length > 0) {
    var i = 0;
    $('.item-draggable-list label').each(function() {
      if (i < 16) {
        options.triggers.push({
          'trigger_name': $(this).data('trigger_name'),
          'trigger_event': $(this).data('trigger_event'),
          'trigger_value': $(this).data('trigger_value')
        });
        i++;
      }
    });
  }

  localStorage.clear();
  localStorage.setItem('options', JSON.stringify(options));

  // Set the return URL depending on the runtime environment
  var return_to = getQueryParam('return_to', 'pebblejs://close#');
  document.location = return_to + encodeURIComponent(JSON.stringify(options));
}

function reset() {
  var r = confirm("Are you sure?");
  if (r == true) {
    options = {'triggers': [], 'key': ''};

    localStorage.clear();

    var return_to = getQueryParam('return_to', 'pebblejs://close#');
    document.location = return_to + encodeURIComponent(JSON.stringify(options));
  }
}

// Get query variables
function getQueryParam(variable, defaultValue) {
  // Find all URL parameters
  var query = location.search.substring(1);
  var vars = query.split('&');

  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');

    // If the query variable parameter is found, decode it to use and return it for use
    if (pair[0] === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return defaultValue || false;
}

$(document).ready(function() {
  $('.item-draggable-handle').remove();

  var temp;
  if (location.hash !== '') {
    temp = location.hash.substring(1);
  } else {
    temp = location.search.substring(1);
  }
  temp = decodeURIComponent(temp);

  if (temp !== '') {
    options = JSON.parse(temp);
  } else if (localStorage.getItem('options') !== null) {
    try {
      options = JSON.parse(localStorage.getItem('options'));
    } catch (e) {
      console.log("error parsing old settings");
    }
  }

  if (options !== undefined) {
    if (options.triggers !== undefined) {
      $(options.triggers).each(function() {
        if ('trigger_name' in this && 'trigger_event' in this && 'trigger_value' in this) {
          add(this.trigger_name, this.trigger_event, this.trigger_value);
        }
      });
    }

    if (options.key !== false) {
      $('input[name="key"]').val(options.key);
    }

    if (options.textColor) {
      $('input[name="textColor"]').val('0x' + decimalToHex(options.textColor, 6));
    }

    if (options.backgroundColor) {
      $('input[name="backgroundColor"]').val('0x' + decimalToHex(options.backgroundColor, 6));
    }

    if (options.highlightTextColor) {
      $('input[name="highlightTextColor"]').val('0x' + decimalToHex(options.highlightTextColor, 6));
    }

    if (options.highlightBackgroundColor) {
      $('input[name="highlightBackgroundColor"]').val('0x' + decimalToHex(options.highlightBackgroundColor, 6));
    }
  }

  $('#reset').click(function() {
    reset();
  });

  $('#save').click(function() {
    save();
  });

  $('#add').click(function() {
    var trigger_name = $('input[name="trigger-name"]').val();
    var trigger_event = $('input[name="trigger-event"]').val();
    var trigger_value = $('input[name="trigger-value"]').val();

    if (trigger_name === '' || trigger_event === '') {
      alert('Need a name and event!');
      return;
    }

    $('input[name="trigger-name"]').val('');
    $('input[name="trigger-event"]').val('');
    $('input[name="trigger-value"]').val('');

    add(trigger_name, trigger_event, trigger_value);
  });

});

function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

var options = [];

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

function add(trigger_name, trigger_event) {
  var item = $(
    '<label class="item">' + trigger_name + ' - ' + trigger_event +
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

  $('.empty').remove();

  remove();
}

function save() {
  options = {'triggers': [], 'key': $('input[name="key"]').val()};

  if ($('.item-draggable-list label').length > 0) {
    $('.item-draggable-list label').each(function() {
      options.key.push({
        'trigger_name': $(this).data('trigger_name'),
        'trigger_event': $(this).data('trigger_event')
      });
    });
  }

  console.log(options);
  document.location = 'pebblejs://close#' + encodeURIComponent(JSON.stringify(options));
}

$(document).ready(function() {
  $('.item-draggable-handle').remove();

  options = JSON.parse(decodeURIComponent(document.location.search.substring(1)));

  console.log(options);

  if (options !== null && 'triggers' in options) {
    $(options.triggers).each(function() {
      if ('trigger_name' in this && 'trigger_event' in this) {
        add(this.trigger_name, this.trigger_event);
      }
    });
  }

  $('#save').click(function() {
    save();
  });

  $('#add').click(function() {
    var trigger_name = $('input[name="trigger-name"]').val();
    var trigger_event = $('input[name="trigger-event"]').val();

    if (trigger_name === '' || trigger_event === '') {
      alert('Need a name and event!');
      return;
    }

    $('input[name="trigger-name"]').val('');
    $('input[name="trigger-event"]').val('');

    add(trigger_name, trigger_event);
  });

});

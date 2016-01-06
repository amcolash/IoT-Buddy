function removeHandler() {
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

function add() {
  var trigger_name = $('input[name="trigger-name"]').val();
  var trigger_event = $('input[name="trigger-event"]').val();

  $('input[name="trigger-name"]').val('');
  $('input[name="trigger-event"]').val('');

  if (trigger_name === '' || trigger_event === '') {
    alert('Need a name and event!');
    return;
  }

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

  removeHandler();
}

$(document).ready(function() {
  $('.item-draggable-handle').remove();

  $('#save').click(function() {
    var options = [];

    if ($('.item-draggable-list label').length > 0) {
      $('.item-draggable-list label').each(function() {
        options.push({
          'trigger_name': $(this).data('trigger_name'),
          'trigger_event': $(this).data('trigger_event')
        });
      });
    }

    console.log(options);
    document.location = 'pebblejs://close#' + encodeURIComponent(JSON.stringify(options));
  });

  $('#add').click(function() {
    add();
  });

});

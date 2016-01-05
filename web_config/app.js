var triggers = [{title: 'Toggle Lights', trigger: 'toggle_lights'}];
var options = {triggers};
//document.location = 'pebblejs://close#' + encodeURIComponent(JSON.stringify(options));

function closeHandler() {
  $('.close').unbind('click');

  $('.close').click(function() {
    $(this).parent().remove();

    if ($('.item-draggable-list label').length === 0) {
      $('.item-draggable-list').append(
        '<span class="item empty">Trigger List Empty</span>'
      );
    }
  });
}

$(document).ready(function() {
  $('.item-draggable-handle').remove();

  $('#add').click(function() {
    var trigger_name = $('input[name="trigger-name"]').val();
    var trigger_event = $('input[name="trigger-event"]').val();

    if (trigger_name === '' || trigger_event === '') {
      alert('Need a name and event!');
      return;
    }

    $('.item-draggable-list').append(
      '<label class="item">' + trigger_name + ' - ' + trigger_event +
        '<span class="close">X</span>' +
        '<div class="item-draggable-handle">' +
          '<div class="item-draggable-handle-bar"></div>' +
          '<div class="item-draggable-handle-bar"></div>' +
          '<div class="item-draggable-handle-bar"></div>' +
        '</div>' +
      '</label>'
    );
    $('.empty').remove();

    closeHandler();
  });
});

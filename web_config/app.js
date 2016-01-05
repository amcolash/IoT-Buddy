var triggers = [{title: 'Toggle Lights', trigger: 'toggle_lights'}];
var options = {triggers};
//document.location = 'pebblejs://close#' + encodeURIComponent(JSON.stringify(options));

$(document).ready(function() {
  $('.item-draggable-list label').append('<span class="close">X</span>');

  $('.close').click(function() {
    $(this).parent().remove();
  });
});

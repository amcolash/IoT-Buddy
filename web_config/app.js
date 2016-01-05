var triggers = [{title: 'Toggle Lights', trigger: 'toggle_lights'}];
var options = {triggers};
document.location = 'pebblejs://close#' + encodeURIComponent(JSON.stringify(options));

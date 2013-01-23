tour = new Escort('#tour');

tour.on('tour-nic-kitty', function() {
  $('#nic-kitty').attr('tab-index', -1);
  var href = $('#nic-kitty').attr('href');
  $('#nic-kitty').attr('href', href + '#tour-finish');
});

tour.on('tour-nic-kitty:hide', function() {
  // change it back
});


$(window).on('load', $.proxy(tour, 'start'));

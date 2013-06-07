// Generated by CoffeeScript 1.6.2
(function() {
  $(document).ready(function() {
    $('.bs-tooltip').tooltip();
    $('img[alt="content image"]').each(function(index, value) {
      return $(this).addClass('img-polaroid');
    });
    $(document).on('click', '.header', function(e) {
      return $('html, body').animate({
        scrollTop: 0
      });
    });
    $(window).on('resize', function(e) {
      return windowResize();
    });
    return windowResize();
  });

  window.windowResize = function() {
    if ($('html').height() < $(window).height()) {
      return $('.footer').addClass('fix-bottom');
    } else {
      return $('.footer').removeClass('fix-bottom');
    }
  };

}).call(this);

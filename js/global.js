//for footer
/*
 * * author @lepture from june
 * */
$(document).ready(function() {
  $('.header').click(function() {
    $('html, body').animate({scrollTop: 0});
  })

  function set_footer() {
    var sth = $(window).scrollTop()
    var wh = $(window).height()
    var dh = $(document).height()
    var fh = $(".footer").height()
    if ((sth + wh + fh) > dh) {
      $(".footer").addClass("show")
    } else {
      $(".footer").removeClass("show")
    }   
  }
  set_footer()
  $(window).resize(set_footer)
  $(window).scroll(set_footer)

  var fixed = false
  function set_header() {
    var sth = $(window).scrollTop()
    if (!fixed && sth > 0) {
      $(".header").addClass("scroll")
      fixed = !fixed
    }
    if (fixed && sth == 0) {
      $(".header").removeClass("scroll")
      fixed = !fixed
    }
  }
  $(window).scroll(set_header)
})

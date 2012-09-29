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
  window.set_footer = set_footer
  $(window).resize(set_footer)
  $(window).scroll(set_footer)

  function set_header() {
    var sth = $(window).scrollTop()
    if (sth >= 31) {
      $(".header").addClass("scroll")
      $("body").addClass("scroll")
      var opacity = (sth - 30) / 10
      if (opacity > 0.8) {
        opacity = 0.8 
      }
      $('.sdw').css('opacity', opacity)
    } else {
      $("body").removeClass("scroll")
      $(".header").removeClass("scroll")
    }
  }
  $(window).scroll(set_header)
  $('.header').affix({
    offset: {
      top: 30
    }
  })
});

$(document).ready(function() {

  // filter post by tag
  function filter_post(url) {
    var index = url.indexOf('#')
    if (index == -1) {
      return
    }
    var tag = url.substr(index + 1)
    $('ul.posts li').each(function() {
      var tags = $(this).attr('data-tags')
      var hide = $(this).attr('data-hide')
      if (tags.indexOf(tag) == -1) {
        if (hide == 'false') {
          $(this).addClass('hide')
          $(this).attr('data-hide', 'true')
        }
      } else {
        if (hide == 'true') {
          $(this).removeClass('hide')
          $(this).attr('data-hide', 'false')
        }
      }
    })
    $('.filter-result').html(tag)
    return tag
  }

  var href = window.location.href
  filter_post(href)

  // setup tag click event
  $(".cloud a").live('click', function(e) {
    e.preventDefault()
    var url = $(this).attr('href')
    var tag = filter_post(url)
    if (typeof tag !== 'undefined'
        && typeof history.pushState !=='undefined') {

      history.pushState({
        tag: '#' + tag
        , path: location.pathname
        , type: 'tags'
      }, null, '#' + tag)

    }
  })

if (typeof history.pushState !== 'undefined') {

  function loadDiscus() {
    if ($('#disqus_thread').length === 0) 
      return;
    /* * * CONFIGURATION VARIABLES: EDIT BEFORE PASTING INTO YOUR WEBPAGE * * */
    var disqus_shortname = 'sheimi-hive'; // required: replace example with your forum shortname

    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function() {
      var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
      dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
  }

  function load_page(href, midaction) {
    $('#loading-wrapper').fadeIn()
    $('.site-main-inner').animate({
      'margin-left': '-=300'
      , 'opacity': 0
    }, {
      easing: 'easeInOutExpo' 
      , duration: 400
      , complete: function() {
        $('.site-main').hide()
        $.get(href).done(function(data) {
          var content = $('.site-main', data).html()
          $('.site-main').html(content)
          $('#loading-wrapper').fadeOut()
          $('.site-main').fadeIn()
          var title = $('title', '<div>' + data + '</div>').text()
          $('title').text(title)
          if (typeof midaction !== 'undefined') {
            midaction()
          }

          if (location.pathname === '/archives/tags.html') {
            filter_post(location.href)
          }
          set_footer()
          loadDiscus()
        })
      }
    })
  }

  $('a.inner-link').live('click', function(e) {
    if (e.ctrlKey || e.metaKey) 
      return
    e.preventDefault();
    var cur = e.currentTarget;
    var href = $(cur).attr('href')

    load_page(href, function() {
      history.pushState({
        path: href
        , type: 'main'
      }, null, href)
    })

  })

  var first = true
  $(window).on('popstate', function(e) {
    e = e.originalEvent
    var state = e.state
    if (state !== null && state.type !== 'main')
      return
    if (state === null && first) {
      first = !first
      return
    }
    var path = location.pathname
    load_page(path)
  })

  $(window).on('popstate', function(e) {
    e = e.originalEvent
    var state = e.state
    if (state === null || state.type !== 'tags')
      return
    if ($('.tag-cloud').length === 0) {
      load_page(state.path)
    } else {
      filter_post(location.href)
    }
  })

  /*
  $(window).on('pageshow', function(e) {
    console.log(e);
  });
  $(window).on('pagehide', function(e) {
    console.log(e);
  });
  */
}

})



$(document).ready () ->
  url = location.href
  filterPost url

  $(document).on 'click', '.cloud a', (e) ->
    e.preventDefault()
    url = $(this).attr 'href'
    tag = filterPost url
    windowResize()
    if tag
      state =
        tag: "##{tag}"
        path: location.pathname
        type: 'tags'
      history.pushState state, null, "##{tag}"

# filter post by tag
filterPost = (url) ->
  index = url.indexOf '#'
  if index == -1
    return
  tag = url.substr index + 1
  $('ul.posts li').each () ->
    tags = eval $(this).data('tags')
    hide = $(this).hasClass 'hide'
    if tag in tags
      $(this).removeClass 'hide'
    else
      $(this).addClass 'hide'
  $('.filter-result').html tag
  return tag

$(window).on 'popstate', (e) ->
  if location.href.indexOf 'tags' >= 0
    filterPost location.href

run: compile
	jekyll --server

compile:
	lessc --compress static/less/site.less > static/css/site.css
	lessc --compress static/less/fontello.css >> static/css/site.css
	lessc --compress static/less/highlight/autumn.css >> static/css/site.css
	coffee -o static/js -c static/coffee

run: compile
	jekyll --server
compile:
	lessc --compress css/screen.less > css/screen.css
	jekyll
	cp _site/index_src.html index.html


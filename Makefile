run: compile
	jekyll --server
compile:
	lessc --compress css/screen.less > css/screen.css
	jekyll
	cp _site/index_src.html index.html
	cp _site/archives/tags_src.html archives/tags.html
upload: compile
	git add .
	echo "Enter commit message: "
	git commit -a -m "post"
	git push



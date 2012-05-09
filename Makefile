run: compile
	jekyll --server
compile:
	lessc --compress css/screen.less > css/screen.css


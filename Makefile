bin := ./node_modules/.bin
ctime := $$(date +%H:%M:%S)

all: build

run: prepare-build css-dev js-dev
	@title="Mei ${ctime}" node app.js

prepare-build:
	@mkdir -p build

build: prepare-build js css

js-dev:
	@${bin}/browserify -t aliasify lib/boot/game.js -o build/game.js

js: js-dev
	@${bin}/uglifyjs build/game.js > build/game.min.js

css-dev:
	@${bin}/lessc lib/style/game.less build/game.css

css:
	@${bin}/cleancss -o build/game.min.css build/game.css

test:
	@${bin}/mocha -b -R spec


.PHONY: build test all

export DENO_DIR := .deno
export BIN_DIR := bin
export DENON := https://deno.land/x/denon@2.5.0/denon.ts
export PUPPETEER := https://deno.land/x/puppeteer@16.2.0/install.ts
export YTDLP := https://github.com/yt-dlp/yt-dlp/releases/download/2022.06.29/yt-dlp

install:
	deno cache **/*.ts "$$DENON"

	PUPPETEER_PRODUCT=chrome deno run -A --unstable "$$PUPPETEER"

	mkdir -p "$$BIN_DIR"

	curl \
		-L "$$YTDLP" \
		-o "$$BIN_DIR/yt-dlp"

	chmod a+rx "$$BIN_DIR/yt-dlp"

dev:
	@deno run \
		--allow-read \
		--allow-write \
		--allow-run \
		"$$DENON" \
		deno check \
		./common/*.ts \
		./automations/**/*.ts

%:
	deno run \
		--no-check \
		--allow-net \
		--allow-env \
		--allow-read \
		--allow-run \
		--allow-write \
		automations/$(MAKECMDGOALS).ts

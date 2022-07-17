export DENO_DIR := .deno
export BIN_DIR := bin
export DENON := https://deno.land/x/denon@2.5.0/denon.ts
export YTDLP := https://github.com/yt-dlp/yt-dlp/releases/download/2022.06.29/yt-dlp

install:
	deno cache \
		--lock-write \
		--lock=lock.json \
		**/*.ts

	deno cache \
		"$$DENON" \
		--lock-write \
		--lock=lock.json \
		**/*.ts

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
		--lock=lock.json \
		./common/*.ts \
		./automations/**/*.ts

%:
	deno run \
		--no-check \
		--allow-net \
		--allow-env \
		--allow-read \
		--allow-run \
		--lock=lock.json \
		automations/$(MAKECMDGOALS).ts

install:
	@deno cache \
		--lock-write \
		--lock=lock.json \
		**/*.ts

dev:
	@deno run \
		--allow-read \
		--allow-write \
		--allow-run \
		https://deno.land/x/denon/denon.ts \
		deno check \
		--lock=lock.json \
		./common/*.ts \
		./automations/**/*.ts

%:
	@deno run \
		--no-check \
		--allow-net \
		--allow-env \
		--allow-read \
		--lock=lock.json \
		automations/$(MAKECMDGOALS).ts

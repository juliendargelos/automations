import { config } from 'dotenv'

config()

await import(`./automations/${process.argv[2]}`)

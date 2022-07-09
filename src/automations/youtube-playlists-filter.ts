import { authenticate } from '../utils/google'

const token = await authenticate()

console.log('ok!')

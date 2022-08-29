import 'dotenv'

import puppeteer from 'puppeteer'
import { SMTPClient } from 'denomailer'

const tmp = await Deno.makeTempDir()

const month = new Date().toLocaleString('fr-fr', { month: 'long' })
const year = new Date().toLocaleString('fr-fr', { year: 'numeric' })

const browser = await puppeteer.launch()
const page = await browser.newPage()

await page.goto('https://www.trainline.fr/signin')
await page.waitForSelector('#onetrust-reject-all-handler')

const rejectCookies = await page.$('#onetrust-reject-all-handler')
await rejectCookies.click()

await page.waitForSelector('[name="email"]')

const email = await page.$('[name="email"]')
const password = await page.$('[name="password"]')

await email.type(Deno.env.get('TRAINLINE_EMAIL'))
await password.type(Deno.env.get('TRAINLINE_PASSWORD'))

await password.press('Enter')
await page.waitForSelector('.header__tickets')

await page.goto('https://www.trainline.fr/tickets')
await page.waitForSelector('.folder__departure-date')

const ticketIndex = await page.evaluate((month, year) => {
  const tickets = [...document.querySelectorAll('[data-year-label]')]
  const pattern = new RegExp(`\\b(?:${month}\\b.*\\b${year}|${year}\\b.*\\b${month})\\b`, 'i')

  let index = 0

  for (const ticket of tickets) {
    const date = ticket.querySelector('.folder__departure-date')

    if (date && pattern.test(date.getAttribute('title'))) {
      return index
    }

    index++
  }

  return -1
}, month, year)

if (ticketIndex >= 0) {
  const client = await page.target().createCDPSession()

  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: tmp
  })

  const ticket = (await page.$$('[data-year-label]'))[ticketIndex]

  ;(await ticket.$('.pnr-footer__proofs .drop-down__label')).click()

  await page.waitForSelector('.proofs-menu__proof')

  ;(await ticket.$('.proofs-menu__proof')).click()

  const file = await new Promise((resolve, reject) => {
    const start = Date.now()

    const interval = setInterval(async () => {
      if (Date.now() - start >= 30000) {
        clearInterval(interval)
        reject(new Error('timeout exceeded'))
        return
      }

      for await (const entry of Deno.readDir(tmp)) {
        if (entry.isFile && entry.name.endsWith('.pdf')) {
          clearInterval(interval)
          resolve(entry)
          break
        }
      }
    }, 1000)
  })

  browser.close()

  const smtp = new SMTPClient({
    connection: {
      hostname: 'smtp.gmail.com',
      port: 465,
      tls: true,
      auth: {
        username: Deno.env.get('GOOGLE_PLUTOTCOOL_EMAIL'),
        password: Deno.env.get('GOOGLE_PLUTOTCOOL_PASSWORD')
      }
    }
  })

  const title = `Justificatif TGV max Julien Dargelos ${month} ${year}`

  await smtp.send({
    from: 'Julien Dargelos <julien@plutot.cool>',
    to: 'admin@plutot.cool',
    cc: 'julien@plutot.cool',
    subject: title,
    content: title,
    attachments: [
      {
        contentType: 'application/pdf',
        filename: file.name,
        encoding: 'binary',
        content: await Deno.readFile(`${tmp}/${file.name}`)
      }
    ]
  })

  await smtp.close()
}

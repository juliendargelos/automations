import 'dotenv'

import puppeteer from 'puppeteer'
import { SMTPClient } from 'denomailer'

const tmp = await Deno.makeTempDir()

const browser = await puppeteer.launch()
const page = await browser.newPage()

await page.goto('https://happycard.force.com/SiteLogin')

const email = await page.$('[id="loginPage:SiteTemplate:formulaire:login-field"]')
const password = await page.$('[id="loginPage:SiteTemplate:formulaire:password-field"]')

await email.type(Deno.env.get('TGVMAX_EMAIL'))
await password.type(Deno.env.get('TGVMAX_PASSWORD'))

await Promise.all([
  password.press('Enter'),
  page.waitForNavigation({ waitUntil: 'networkidle2' })
])

await page.goto('https://www.tgvmax.fr/trainline/fr-FR/factures')
await page.waitForNavigation({ waitUntil: 'networkidle2' })

const client = await page.target().createCDPSession()

await client.send('Page.setDownloadBehavior', {
  behavior: 'allow',
  downloadPath: tmp
})

await page.waitForSelector('.link-download')

const name = await page.evaluate(
  name => name.textContent,
  await page.$('.bills-date-info')
)

await page.click('.link-download')

await page.waitForNetworkIdle()

await browser.close()

let invoice = ''

for await (const entry of Deno.readDir(tmp)) {
  if (entry.isFile && entry.name.endsWith('.pdf')) {
    invoice = `${tmp}/${entry.name}`
    break
  }
}

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

const title = `TGV max Julien Dargelos - ${name}`

await smtp.send({
  from: 'Julien Dargelos <julien@plutot.cool>',
  to: 'admin@plutot.cool',
  cc: 'julien@plutot.cool',
  subject: title,
  content: title,
  attachments: [
    {
      contentType: 'application/pdf',
      filename: `${title}.pdf`,
      encoding: 'binary',
      content: await Deno.readFile(invoice)
    }
  ]
})

await smtp.close()

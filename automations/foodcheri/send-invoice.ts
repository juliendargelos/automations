import 'dotenv'

import puppeteer from 'puppeteer'
import { SMTPClient } from 'denomailer'

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.goto('https://www.foodcheri.com/connexion')

const emailInput = await page.waitForSelector('input[name="username"]')
await emailInput.type(Deno.env.get('FOODCHERI_EMAIL'), { delay: 100 })
await emailInput.press('Enter')

const passwordInput = await page.waitForSelector('input[name="password"]')
await passwordInput.type(Deno.env.get('FOODCHERI_PASSWORD'), { delay: 100 })
await emailInput.press('Enter')

await page.waitForNetworkIdle()

const profileButton = await page.waitForSelector('img[class*="userIcon-"]')
await profileButton.click()

const invoicesButton = await page.waitForSelector('.select_ma_facturation')
await invoicesButton.click()

await page.waitForSelector('div[class*="invoicesContainer-"]')
const invoiceItems = await page.$$('div[class*="billContent-"]')

const todayDate = new Date()
  .toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })
  .split(' ')[0]

let todayInvoiceItem: any
let invoicePath = ''
let invoiceDate = ''

for (const invoiceItem of invoiceItems) {
  const date = parseDate(await invoiceItem.$eval(
    'span[class*="dateContainer-"]',
    node => node.textContent
  ))

  if (date === todayDate) {
    invoiceDate = date.split('/').map(t => t.padStart(2, '0')).join('-')
    todayInvoiceItem = invoiceItem
    break
  }
}

if (todayInvoiceItem) {
  const tmp = await Deno.makeTempDir()
  const client = await page.target().createCDPSession()
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: tmp
  })

  const downloadButton = await todayInvoiceItem.$('div[class*="btnDownload-"]')
  await downloadButton.click()
  await page.waitForNetworkIdle()

  for await (const entry of Deno.readDir(tmp)) {
    if (entry.isFile && entry.name.endsWith('.pdf')) {
      invoicePath = `${tmp}/${entry.name}`
      break
    }
  }
}

await browser.close()

if (invoicePath) {
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

  const title = `Foodchéri Julien Dargelos - Facture ${invoiceDate}`

  await smtp.send({
    from: 'Julien Dargelos <julien@plutot.cool>',
    to: Deno.env.get('QONTO_INVOICE_EMAIL'),
    cc: 'julien@plutot.cool',
    subject: title,
    content: title,
    attachments: [
      {
        contentType: 'application/pdf',
        filename: `Facture Foodcheri ${invoiceDate}.pdf`,
        encoding: 'binary',
        content: await Deno.readFile(invoicePath)
      }
    ]
  })

  await smtp.close()
}

function parseDate(date: string): string {
  const [day, monthString, year] = date
    .trim()
    .toLowerCase()
    .replace(/\s\s+/g, ' ')
    .split(' ')

  const month = 1 + [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre'
  ].indexOf(monthString)

  return `${day}/${month}/${year}`
}

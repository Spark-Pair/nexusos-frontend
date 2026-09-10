import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'
import { chromium } from '@playwright/test'

const svg = await readFile(new URL('../public/icons/nexusos.svg', import.meta.url), 'utf8')
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 })
  for (const size of [180, 192, 512]) {
    await page.setViewportSize({ width: size, height: size })
    await page.setContent(
      `<style>html,body{margin:0;width:100%;height:100%;background:#287663}svg{width:100%;height:100%;display:block}</style>${svg}`
    )
    await page.screenshot({
      path: new URL(`../public/icons/nexusos-${size}.png`, import.meta.url).pathname.replace(
        /^\/(\w:)/,
        '$1'
      )
    })
  }
} finally {
  await browser.close()
}

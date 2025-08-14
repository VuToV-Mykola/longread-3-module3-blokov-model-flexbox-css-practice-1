const puppeteer = require('puppeteer')
const {spawn} = require('child_process')
const fs = require('fs')
const path = require('path')

;(async () => {
  let serverProcess
  const screenshotPath = path.resolve('screenshot.png')

  try {
    if (fs.existsSync(screenshotPath)) fs.unlinkSync(screenshotPath)

    // Запуск локального сервера
    serverProcess = spawn('npx', ['http-server', '.', '-p', '3000'], {
      stdio: 'inherit',
      shell: true
    })
    await new Promise(resolve => setTimeout(resolve, 30000))

    // Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome'
    })

    const page = await browser.newPage()
    await page.goto('http://localhost:3000', {waitUntil: 'networkidle0'})
    await page.screenshot({path: screenshotPath, fullPage: true})

    await browser.close()

    const stats = fs.statSync(screenshotPath)
    console.log(`✅ Screenshot saved: ${screenshotPath} (${Math.round(stats.size / 1024)} KB)`)
  } catch (err) {
    console.error('❌ Failed to generate screenshot:', err)
    process.exit(1)
  } finally {
    if (serverProcess) serverProcess.kill()
  }
})()

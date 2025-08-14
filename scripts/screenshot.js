const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function takeScreenshot() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    executablePath: '/usr/bin/google-chrome'
  });
  
  const page = await browser.newPage();
  
  // Отримуємо URL з GitHub Pages або локальний файл
  const githubPages = `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io/${process.env.GITHUB_REPOSITORY_NAME}/`;
  const indexPath = path.join(process.cwd(), 'index.html');
  
  let targetUrl;
  if (fs.existsSync(indexPath)) {
    targetUrl = `file://${indexPath}`;
  } else {
    targetUrl = githubPages;
    console.log(`📡 Using GitHub Pages URL: ${targetUrl}`);
  }
  
  try {
    await page.setViewport({
      width: parseInt(process.env.SCREENSHOT_WIDTH) || 1920,
      height: parseInt(process.env.SCREENSHOT_HEIGHT) || 1080
    });
    
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const selector = process.env.SCREENSHOT_SELECTOR || 'body';
    await page.waitForSelector(selector, { timeout: 10000 });
    
    await page.screenshot({
      path: 'screenshot.png',
      fullPage: true,
      type: 'png'
    });
    
    console.log('✅ Screenshot created successfully');
  } catch (error) {
    console.error('❌ Screenshot failed:', error.message);
    // Створюємо заглушку
    const canvas = require('canvas').createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 800, 600);
    ctx.fillStyle = '#333';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Screenshot not available', 400, 300);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('screenshot.png', buffer);
  }
  
  await browser.close();
}

takeScreenshot().catch(console.error);

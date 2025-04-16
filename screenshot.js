// screenshot.js
import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshot() {
  console.log('Launching browser...');
  
  // Launch the browser with path to Chrome
  const browser = await puppeteer.launch({
    headless: "new", // Use the new headless mode
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    defaultViewport: {
      width: 1280,
      height: 800
    }
  });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Navigate to the homepage of the real-time quiz application
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3002', {
      waitUntil: 'networkidle2', // Wait until the network is idle
      timeout: 30000 // 30 seconds timeout
    });
    
    // Wait for an additional 5 seconds to ensure dynamic content loads
    console.log('Waiting for content to load...');
    await wait(5000);
    
    // Wait for quiz content to appear (adjust the selector based on your actual page structure)
    try {
      console.log('Waiting for quiz elements to appear...');
      await page.waitForSelector('.v-card, .quiz-card', { timeout: 10000 });
      console.log('Quiz elements found!');
    } catch (error) {
      console.log('Quiz elements selector timeout, taking screenshot anyway');
    }
    
    // Define the screenshot path
    const screenshotPath = path.join(__dirname, 'homepage-screenshot.png');
    
    // Take a screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    console.log(`Screenshot saved to: ${screenshotPath}`);
  } catch (error) {
    console.error('Error during screenshot process:', error);
  } finally {
    // Close the browser
    await browser.close();
    console.log('Browser closed.');
  }
}

// Run the function
takeScreenshot();
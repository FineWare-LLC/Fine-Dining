#!/usr/bin/env node

/**
 * Test script to reproduce the blank screen issue
 * This will help identify the exact error causing the rendering failure
 */

const puppeteer = require('puppeteer');

async function testBlankScreen() {
    console.log('🔍 Testing blank screen issue...');
    
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Listen for console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Console Error:', msg.text());
            }
        });
        
        // Listen for page errors
        page.on('pageerror', error => {
            console.log('❌ Page Error:', error.message);
        });
        
        // Navigate to the application
        console.log('📍 Navigating to http://localhost:3001...');
        const response = await page.goto('http://localhost:3001', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        console.log('📊 Response status:', response.status());
        
        // Wait a bit for React to render
        await page.waitForTimeout(3000);
        
        // Check if there's any content in the body
        const bodyContent = await page.evaluate(() => {
            return document.body.innerHTML;
        });
        
        console.log('📄 Body content length:', bodyContent.length);
        
        if (bodyContent.length < 100) {
            console.log('⚠️  Body content is very short, likely blank screen');
            console.log('Body content:', bodyContent.substring(0, 200));
        } else {
            console.log('✅ Body has content, checking for specific elements...');
        }
        
        // Check for specific React elements
        const hasReactRoot = await page.evaluate(() => {
            return document.querySelector('#__next') !== null;
        });
        
        console.log('🔧 Has Next.js root element:', hasReactRoot);
        
        // Check for any visible text
        const visibleText = await page.evaluate(() => {
            return document.body.innerText.trim();
        });
        
        console.log('📝 Visible text length:', visibleText.length);
        if (visibleText.length > 0) {
            console.log('📝 First 200 chars of visible text:', visibleText.substring(0, 200));
        }
        
        // Take a screenshot for debugging
        await page.screenshot({ path: 'blank_screen_debug.png' });
        console.log('📸 Screenshot saved as blank_screen_debug.png');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Check if puppeteer is available
try {
    testBlankScreen();
} catch (error) {
    console.log('⚠️  Puppeteer not available, trying simple HTTP test...');
    
    // Fallback to simple HTTP test
    const http = require('http');
    
    const req = http.get('http://localhost:3001', (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📊 Response status:', res.statusCode);
            console.log('📄 Content length:', data.length);
            
            if (data.length < 100) {
                console.log('⚠️  Response is very short, likely blank');
                console.log('Response:', data);
            } else {
                console.log('✅ Response has content');
                // Look for common HTML elements
                if (data.includes('<html')) {
                    console.log('✅ Contains HTML structure');
                }
                if (data.includes('__next')) {
                    console.log('✅ Contains Next.js root element');
                }
                if (data.includes('Fine Dining')) {
                    console.log('✅ Contains app title');
                }
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ HTTP request failed:', error.message);
    });
    
    req.setTimeout(10000, () => {
        console.error('❌ Request timeout');
        req.destroy();
    });
}
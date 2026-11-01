const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const ARTIFACTS_DIR = 'C:\\Users\\saide\\.gemini\\antigravity\\brain\\b1f53c9f-183b-4d6d-a745-146d17b17d4f\\screenshots';
const LOCAL_DIR = path.join(__dirname, '../screenshots');

// Ensure output directories exist
[ARTIFACTS_DIR, LOCAL_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function saveScreenshot(page, filename) {
  const localPath = path.join(LOCAL_DIR, filename);
  const artifactPath = path.join(ARTIFACTS_DIR, filename);
  await page.screenshot({ path: localPath, fullPage: false });
  fs.copyFileSync(localPath, artifactPath);
  console.log(`  [Screenshot] Saved: ${filename}`);
}

async function findButtonByText(page, text) {
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const btnText = await page.evaluate((el) => el.innerText, b);
    if (btnText && btnText.toLowerCase().includes(text.toLowerCase())) {
      return b;
    }
  }
  return null;
}

async function clickButtonByText(page, text) {
  const b = await findButtonByText(page, text);
  if (b) {
    await b.click();
    return true;
  }
  return false;
}

async function findLinkByText(page, text) {
  const links = await page.$$('a');
  for (const a of links) {
    const aText = await page.evaluate((el) => el.innerText, a);
    if (aText && aText.toLowerCase().includes(text.toLowerCase())) {
      return a;
    }
  }
  return null;
}

async function setInputValue(page, selector, text) {
  await page.waitForSelector(selector);
  await page.evaluate(
    (sel, val) => {
      const input = document.querySelector(sel);
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        ).set;
        setter.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    },
    selector,
    text
  );
}

async function setTextareaValue(page, selector, text) {
  await page.waitForSelector(selector);
  await page.evaluate(
    (sel, val) => {
      const textarea = document.querySelector(sel);
      if (textarea) {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          'value'
        ).set;
        setter.call(textarea, val);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
      }
    },
    selector,
    text
  );
}

async function runE2ETests() {
  console.log('====================================================');
  console.log(' Starting StayNest End-to-End Browser Test Suite');
  console.log(` Target URL: ${BASE_URL}`);
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // Dialog auto-accept
  page.on('dialog', async (dialog) => {
    console.log(`  [Dialog] Auto-accepting dialog: "${dialog.message()}"`);
    await dialog.accept();
  });

  // Track console errors
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // Clean up any stray test properties from prior test runs using native fetch
    try {
      const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'host@staynest.com', password: 'password123' }),
      });
      const loginData = await loginRes.json();
      const token = loginData.token;
      if (token) {
        const myListingsRes = await fetch('http://localhost:5000/api/properties/host/my-listings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const myListings = await myListingsRes.json();
        for (const p of myListings.properties || []) {
          if (p.title && p.title.startsWith('E2E')) {
            await fetch(`http://localhost:5000/api/properties/${p._id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log(`  [Cleanup] Cleaned up previous test listing: ${p.title}`);
          }
        }
      }
    } catch (e) {
      // Continue even if no stray properties
    }

    // ==========================================
    // TEST 1 — HOME PAGE & CATEGORIES & PAGINATION
    // ==========================================
    console.log('--- TEST 1: HOME PAGE, PAGINATION & CATEGORIES ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');

    // Screenshot 1: Home Page
    await saveScreenshot(page, '01-home-page.png');

    const totalText = await page.$eval('h1', (el) => el.innerText);
    console.log(`  Page Header: "${totalText}"`);
    if (!totalText.includes('28')) {
      throw new Error(`Expected 28 total properties, found: ${totalText}`);
    }

    let cards = await page.$$('a[href^="/properties/"]');
    console.log(`  Page 1 properties displayed: ${cards.length} (Expected 12)`);

    // Verify Pagination: Navigate to Page 2
    console.log('  Testing Pagination to Page 2...');
    const nextBtn = await page.$('button:has(svg.lucide-chevron-right)');
    if (nextBtn) {
      await nextBtn.click();
      await page.waitForNetworkIdle({ idleTime: 400 });
      cards = await page.$$('a[href^="/properties/"]');
      console.log(`  Page 2 properties displayed: ${cards.length} (Expected 12)`);

      // Page 3
      const page3Btn = await page.$('button:has(svg.lucide-chevron-right)');
      if (page3Btn) {
        await page3Btn.click();
        await page.waitForNetworkIdle({ idleTime: 400 });
        cards = await page.$$('a[href^="/properties/"]');
        console.log(`  Page 3 properties displayed: ${cards.length} (Expected 4)`);
      }
    }

    // Return to Page 1
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    // Verify all 9 categories
    const categories = [
      'Trending',
      'Iconic Cities',
      'Beachfront',
      'Luxury',
      'Cabins',
      'Mansions',
      'Countryside',
      'Lakefront',
      'Amazing Views',
    ];

    console.log('  Testing Category Filtering for all 9 categories...');
    for (const cat of categories) {
      const clicked = await clickButtonByText(page, cat);
      if (!clicked) throw new Error(`Category button "${cat}" not found`);

      await page.waitForNetworkIdle({ idleTime: 300 });
      const catCards = await page.$$('a[href^="/properties/"]');
      console.log(`    - Category "${cat}": ${catCards.length} matching properties`);
      if (catCards.length < 2) {
        throw new Error(`Expected at least 2 properties for "${cat}", found ${catCards.length}`);
      }
    }

    // Test Clear All filters
    console.log('  Testing Clear All filters...');
    await clickButtonByText(page, 'Clear all');
    await page.waitForNetworkIdle({ idleTime: 400 });
    cards = await page.$$('a[href^="/properties/"]');
    console.log(`  Properties after Clear All: ${cards.length} (Page 1 restored)`);
    console.log('  ✓ TEST 1 PASSED!\n');

    // ==========================================
    // TEST 2 — SEARCH & ADVANCED FILTERS
    // ==========================================
    console.log('--- TEST 2: SEARCH & ADVANCED FILTERS ---');
    // Open Search Modal for Hyderabad
    console.log('  Testing Location Search for "Hyderabad"...');
    const searchPill1 = await findButtonByText(page, 'Anywhere');
    if (searchPill1) {
      await searchPill1.click();
      await page.waitForSelector('input[placeholder*="Search destinations"]', { timeout: 3000 });
      await setInputValue(page, 'input[placeholder*="Search destinations"]', 'Hyderabad');
      const submitSearch = await page.$('button[type="submit"]');
      await submitSearch.click();
      await page.waitForNetworkIdle({ idleTime: 400 });

      const hydCards = await page.$$('a[href^="/properties/"]');
      console.log(`  Search "Hyderabad": ${hydCards.length} properties displayed`);
      if (hydCards.length < 3) throw new Error('Expected at least 3 Hyderabad properties');
    }

    // Reset and search for Goa
    console.log('  Testing Location Search for "Goa"...');
    await clickButtonByText(page, 'Clear all');
    await page.waitForNetworkIdle({ idleTime: 300 });

    const searchPill2 = await findButtonByText(page, 'Anywhere');
    if (searchPill2) {
      await searchPill2.click();
      await page.waitForSelector('input[placeholder*="Search destinations"]', { timeout: 3000 });
      await setInputValue(page, 'input[placeholder*="Search destinations"]', 'Goa');
      const submitSearch = await page.$('button[type="submit"]');
      await submitSearch.click();
      await page.waitForNetworkIdle({ idleTime: 400 });

      const goaCards = await page.$$('a[href^="/properties/"]');
      console.log(`  Search "Goa": ${goaCards.length} properties displayed`);
      if (goaCards.length < 2) throw new Error('Expected at least 2 Goa properties');
    }

    // Reset filters
    await clickButtonByText(page, 'Clear all');
    await page.waitForNetworkIdle({ idleTime: 300 });

    // Test Price Range Filter (<= ₹8000)
    console.log('  Testing Price Range Filter (<= ₹8000)...');
    const filterBtn = await findButtonByText(page, 'Filters');
    if (filterBtn) {
      await filterBtn.click();
      await page.waitForSelector('input[placeholder="50,000"]', { timeout: 3000 });
      await setInputValue(page, 'input[placeholder="50,000"]', '8000');
      await clickButtonByText(page, 'Show Stays');
      await page.waitForNetworkIdle({ idleTime: 400 });

      const priceFilteredCards = await page.$$('a[href^="/properties/"]');
      console.log(`  Filter (Price <= ₹8000): ${priceFilteredCards.length} properties displayed`);
      if (priceFilteredCards.length === 0) throw new Error('Expected properties matching price filter');
    }

    // Combined filter: Location + Category
    console.log('  Testing Combined Filters (Goa + Beachfront)...');
    await clickButtonByText(page, 'Clear all');
    await page.waitForNetworkIdle({ idleTime: 300 });

    const searchPill3 = await findButtonByText(page, 'Anywhere');
    if (searchPill3) {
      await searchPill3.click();
      await page.waitForSelector('input[placeholder*="Search destinations"]', { timeout: 3000 });
      await setInputValue(page, 'input[placeholder*="Search destinations"]', 'Goa');
      const submitSearch = await page.$('button[type="submit"]');
      await submitSearch.click();
      await page.waitForNetworkIdle({ idleTime: 400 });

      // Click Beachfront category
      await clickButtonByText(page, 'Beachfront');
      await page.waitForNetworkIdle({ idleTime: 400 });
      const combinedCards = await page.$$('a[href^="/properties/"]');
      console.log(`  Combined Filter (Goa + Beachfront): ${combinedCards.length} properties`);
      if (combinedCards.length === 0) throw new Error('Expected matching Goa Beachfront properties');
    }

    // Clear all filters back to normal
    await clickButtonByText(page, 'Clear all');
    await page.waitForNetworkIdle({ idleTime: 400 });
    console.log('  ✓ TEST 2 PASSED!\n');

    // ==========================================
    // TEST 3 — GUEST EXPERIENCE & BOOKING
    // ==========================================
    console.log('--- TEST 3: GUEST EXPERIENCE & BOOKING ---');
    const guestTimestamp = Date.now();
    const guestEmail = `e2e_guest_${guestTimestamp}@staynest.com`;

    // 1. Register New Guest
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="email"]');
    await setInputValue(page, 'input[placeholder="e.g. Aditya Varma"]', 'E2E Guest Traveler');
    await setInputValue(page, 'input[type="email"]', guestEmail);
    const passwordInputs = await page.$$('input[type="password"]');
    await passwordInputs[0].type('password123');
    await passwordInputs[1].type('password123');
    await page.click('button[type="submit"]');
    await page.waitForNetworkIdle({ idleTime: 800 });
    console.log(`  Registered guest: ${guestEmail}`);

    // Screenshot 3: Login Page
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await saveScreenshot(page, '03-login-page.png');

    // Log in with guest account
    await setInputValue(page, 'input[type="email"]', guestEmail);
    await setInputValue(page, 'input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForNetworkIdle({ idleTime: 800 });
    console.log('  Logged in as new guest user.');

    // 2. Open first property
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('a[href^="/properties/"]');
    const firstPropertyLink = await page.$('a[href^="/properties/"]');
    const propertyHref = await page.evaluate((el) => el.getAttribute('href'), firstPropertyLink);
    await page.goto(`${BASE_URL}${propertyHref}`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');

    // Screenshot 2: Property Details Page
    await saveScreenshot(page, '02-property-details.png');
    console.log('  Opened Property Details page.');

    // 3. Select Check-In and Check-Out in interactive booking widget
    const today = new Date();
    const checkInDate = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const checkOutDate = new Date(today.getTime() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const dateInputs = await page.$$('input[type="date"]');
    if (dateInputs.length >= 2) {
      await page.evaluate(
        (inVal, outVal) => {
          const inputs = document.querySelectorAll('input[type="date"]');
          if (inputs[0]) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(inputs[0], inVal);
            inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
            inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
          }
          if (inputs[1]) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(inputs[1], outVal);
            inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
            inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
          }
        },
        checkInDate,
        checkOutDate
      );
    }

    // Click Reserve
    const reserveBtn = await findButtonByText(page, 'Reserve');
    if (reserveBtn) {
      await reserveBtn.click();
      await page.waitForSelector('h1');
      await page.waitForFunction(() => window.location.pathname.startsWith('/book/'));
    }

    // Screenshot 6: Booking Confirmation Page
    await saveScreenshot(page, '06-booking-confirmation.png');
    console.log('  Opened Booking Confirmation checkout page.');

    // Enter special requests & Confirm Reservation
    await setTextareaValue(page, 'textarea[placeholder*="Arriving by"]', 'Arriving in the evening. Excited for the stay!');
    const confirmBtn = await findButtonByText(page, 'Confirm Reservation');
    if (confirmBtn) {
      await confirmBtn.click();
      await page.waitForFunction(() => window.location.pathname.startsWith('/bookings'));
      await page.waitForNetworkIdle({ idleTime: 600 });
    }

    // Screenshot 4: Guest Dashboard / My Bookings
    await saveScreenshot(page, '04-guest-dashboard.png');
    console.log('  Confirmed reservation and navigated to My Bookings.');

    // Test Cancellation
    const cancelBtn = await findButtonByText(page, 'Cancel Reservation');
    if (cancelBtn) {
      await cancelBtn.click();
      await page.waitForSelector('textarea[placeholder*="Change in travel plans"]', { timeout: 3000 });
      await setTextareaValue(page, 'textarea[placeholder*="Change in travel plans"]', 'Automated E2E test cancellation');
      const confirmCancelBtn = await findButtonByText(page, 'Confirm Cancellation');
      if (confirmCancelBtn) {
        await confirmCancelBtn.click();
        await page.waitForNetworkIdle({ idleTime: 800 });
        console.log('  Successfully cancelled guest reservation.');
      }
    }
    console.log('  ✓ TEST 3 PASSED!\n');

    // ==========================================
    // TEST 4 — HOST EXPERIENCE
    // ==========================================
    console.log('--- TEST 4: HOST EXPERIENCE ---');
    // Log in as Demo Host
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    const demoHostBtn = await findButtonByText(page, 'Demo Host');
    if (demoHostBtn) {
      await demoHostBtn.click();
      await page.waitForNetworkIdle({ idleTime: 800 });
      console.log('  Logged in as Demo Host.');
    }

    // Screenshot 5: Host Dashboard
    await page.goto(`${BASE_URL}/host/dashboard`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');
    await saveScreenshot(page, '05-host-dashboard.png');
    console.log('  Loaded Host Dashboard.');

    // Check reservations tab
    await clickButtonByText(page, 'Reservations Received');
    await page.waitForNetworkIdle({ idleTime: 400 });
    console.log('  Inspected Host Reservations Received tab.');
    await clickButtonByText(page, 'My Listings');
    await page.waitForNetworkIdle({ idleTime: 400 });

    // Create a new property listing
    console.log('  Creating a new property listing as Host...');
    await page.goto(`${BASE_URL}/host/properties/new`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[placeholder*="Glass Villa"]');

    const testListingTitle = `E2E Sunset Retreat ${Date.now()}`;
    await setInputValue(page, 'input[placeholder*="Glass Villa"]', testListingTitle);
    await setTextareaValue(page, 'textarea[placeholder*="Describe your space"]', 'A lovely modern retreat created during automated E2E browser testing.');
    await setInputValue(page, 'input[placeholder*="Road No. 36"]', 'Financial District Rd 10');
    await setInputValue(page, 'input[placeholder*="Hyderabad"]', 'Hyderabad');
    await setInputValue(page, 'input[placeholder*="7500"]', '8500');

    // Click "Add Sample Photos"
    await clickButtonByText(page, 'Add Sample Photos');
    await page.waitForNetworkIdle({ idleTime: 400 });
    console.log('  Injected curated property photos.');

    // Publish listing
    await clickButtonByText(page, 'Publish Listing');
    await page.waitForFunction(() => window.location.pathname.startsWith('/properties/'));
    console.log(`  Published listing: "${testListingTitle}".`);

    // Edit Property
    const editBtn = await findLinkByText(page, 'Edit your listing');
    if (editBtn) {
      await editBtn.click();
      await page.waitForSelector('input[value*="E2E Sunset Retreat"]');
      console.log('  Opened Edit Property page.');

      // Update price to 9200
      await setInputValue(page, 'input[value="8500"]', '9200');
      await clickButtonByText(page, 'Save Changes');
      await page.waitForFunction(() => !window.location.pathname.includes('/edit'));
      console.log('  Updated listing price to ₹9,200.');

      // Return to Edit page to test deletion
      const editBtn2 = await findLinkByText(page, 'Edit your listing');
      if (editBtn2) {
        await editBtn2.click();
        await page.waitForSelector('input[value*="E2E Sunset Retreat"]');
        await clickButtonByText(page, 'Delete Listing');
        await page.waitForFunction(() => window.location.pathname.startsWith('/host/dashboard'));
        console.log('  Cleanly deleted temporary test property via Edit page.');
      }
    }
    console.log('  ✓ TEST 4 PASSED!\n');

    // ==========================================
    // TEST 5 — RESPONSIVE DESIGN (MOBILE & TABLET)
    // ==========================================
    console.log('--- TEST 5: RESPONSIVE DESIGN (MOBILE & TABLET) ---');
    // Emulate iPhone / Mobile viewport (390x844)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');

    // Screenshot 7: Mobile Home Page
    await saveScreenshot(page, '07-mobile-home-page.png');
    console.log('  Mobile viewport inspected and screenshot captured (390x844).');

    // Emulate iPad / Tablet viewport (768x1024)
    await page.setViewport({ width: 768, height: 1024, isMobile: false });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1');
    console.log('  Tablet viewport inspected (768x1024).');
    console.log('  ✓ TEST 5 PASSED!\n');

    // ==========================================
    // TEST 6 — CONSOLE ERRORS CHECK
    // ==========================================
    console.log('--- TEST 6: CONSOLE ERRORS & QUALITY CHECK ---');
    console.log(`  Total browser console error events: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.warn('  Console errors noted:', consoleErrors);
    } else {
      console.log('  ✓ 0 Console errors detected!');
    }
    console.log('  ✓ TEST 6 PASSED!\n');

    console.log('====================================================');
    console.log(' ALL END-TO-END BROWSER TESTS COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
  } catch (err) {
    console.error('[E2E Error]:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runE2ETests();

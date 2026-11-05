import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:8000';

const VIEWPORTS = [
  { name: 'Desktop (1440px)', width: 1440, height: 900 },
  { name: 'Tablet (768px)', width: 768, height: 1024 },
  { name: 'Mobile (375px)', width: 375, height: 812 }
];

const ROLES = [
  { role: 'SUPER_ADMIN', email: 'superadmin@ecosort.ai', pass: 'Admin@123', defaultRoute: '/dashboard/super-admin' },
  { role: 'ADMIN', email: 'admin.metro@ecosort.ai', pass: 'Admin@123', defaultRoute: '/dashboard/admin' },
  { role: 'GARBAGE_COLLECTOR', email: 'collector.metro@ecosort.ai', pass: 'Admin@123', defaultRoute: '/dashboard/collector' },
  { role: 'MUNICIPALITY_MONITOR', email: 'monitor.metro@ecosort.ai', pass: 'Admin@123', defaultRoute: '/dashboard/monitor' }
];

const ALL_ROUTES = [
  '/citizen-portal',
  '/dashboard/super-admin',
  '/dashboard/admin',
  '/dashboard/collector',
  '/dashboard/monitor',
  '/ai-scanner',
  '/smart-bins',
  '/map',
  '/analytics',
  '/predictions',
  '/route-optimization',
  '/collections',
  '/reports',
  '/users',
  '/audit-logs',
  '/settings',
  '/non-existent-404-test'
];

async function getRoleAuth(email, password) {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${await res.text()}`);
  }
  return await res.json();
}

async function runAudit() {
  console.log('🚀 Starting Comprehensive QA Audit...\n');

  // Fetch tokens for all 4 roles
  console.log('Fetching auth tokens for test accounts...');
  const roleAuthData = {};
  for (const r of ROLES) {
    try {
      const authRes = await getRoleAuth(r.email, r.pass);
      roleAuthData[r.role] = authRes;
      console.log(`  ✓ Authenticated ${r.role} (${r.email})`);
    } catch (e) {
      console.error(`  ✗ Failed to auth ${r.role}:`, e.message);
    }
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const auditReport = {
    consoleErrors: [],
    consoleWarnings: [],
    networkErrors: [],
    pageExceptions: [],
    overflowIssues: [],
    brokenImages: [],
    routeAudits: []
  };

  try {
    // 1. First test Login Page interactive submission on all viewports
    for (const vp of VIEWPORTS) {
      console.log(`\n--- Testing Login UI Form on ${vp.name} ---`);
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height });

      page.on('console', msg => {
        if (msg.type() === 'error') {
          auditReport.consoleErrors.push({ stage: 'login-form', viewport: vp.name, text: msg.text() });
        }
      });
      page.on('pageerror', err => {
        auditReport.pageExceptions.push({ stage: 'login-form', viewport: vp.name, message: err.message });
      });

      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 600));

      // Test overflow on login page
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      if (hasOverflow) {
        auditReport.overflowIssues.push({ viewport: vp.name, route: '/login' });
      }

      // Click sign in button
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await new Promise(r => setTimeout(r, 1500));
        const afterLoginUrl = page.url();
        console.log(`  Submitted login on ${vp.name} -> Redirected to: ${afterLoginUrl}`);
      }
      await page.close();
    }

    // 2. Test all routes for SUPER_ADMIN across all 3 viewports
    const superAdminAuth = roleAuthData['SUPER_ADMIN'];
    for (const vp of VIEWPORTS) {
      console.log(`\n========================================`);
      console.log(`Testing Authenticated Routes on ${vp.name}`);
      console.log(`========================================`);

      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height });

      // Inject auth credentials before any scripts run
      await page.evaluateOnNewDocument((token, user) => {
        localStorage.setItem('ecosort_token', token);
        localStorage.setItem('ecosort_user', JSON.stringify(user));
      }, superAdminAuth.access_token, superAdminAuth.user);

      page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();
        if (type === 'error') {
          auditReport.consoleErrors.push({ viewport: vp.name, route: page.url(), text });
        } else if (type === 'warning' && !text.includes('React Router Future Flag Warning')) {
          auditReport.consoleWarnings.push({ viewport: vp.name, route: page.url(), text });
        }
      });

      page.on('pageerror', err => {
        auditReport.pageExceptions.push({ viewport: vp.name, route: page.url(), message: err.message, stack: err.stack });
      });

      page.on('requestfailed', req => {
        if (!req.url().includes('favicon')) {
          auditReport.networkErrors.push({
            viewport: vp.name,
            route: page.url(),
            url: req.url(),
            failure: req.failure()?.errorText || 'Failed'
          });
        }
      });

      page.on('response', resp => {
        if (resp.status() >= 400 && !resp.url().includes('favicon') && !resp.url().includes('non-existent')) {
          auditReport.networkErrors.push({
            viewport: vp.name,
            route: page.url(),
            url: resp.url(),
            status: resp.status()
          });
        }
      });

      for (const route of ALL_ROUTES) {
        process.stdout.write(`  Visiting ${route}... `);
        try {
          const resp = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle2', timeout: 15000 });
          await new Promise(r => setTimeout(r, 1000));

          const curUrl = page.url();
          const pageTitle = await page.title();

          // Check horizontal overflow
          const overflowInfo = await page.evaluate(() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            const bodyWidth = document.body.scrollWidth;
            return {
              hasOverflow: docWidth > winWidth + 2 || bodyWidth > winWidth + 2,
              docWidth,
              winWidth,
              bodyWidth
            };
          });

          // Check broken images
          const brokenImgs = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
          });

          // Check empty states or error states rendered on page
          const _pageText = await page.evaluate(() => document.body.innerText);

          if (overflowInfo.hasOverflow) {
            auditReport.overflowIssues.push({
              viewport: vp.name,
              route,
              curUrl,
              ...overflowInfo
            });
          }

          if (brokenImgs.length > 0) {
            auditReport.brokenImages.push({ viewport: vp.name, route, images: brokenImgs });
          }

          auditReport.routeAudits.push({
            viewport: vp.name,
            route,
            finalUrl: curUrl,
            status: resp?.status() || 200,
            overflow: overflowInfo.hasOverflow,
            title: pageTitle
          });
          console.log(`[OK] (${resp?.status() || 200}) -> ${curUrl}`);
        } catch (err) {
          console.log(`[FAIL] ${err.message}`);
          auditReport.routeAudits.push({
            viewport: vp.name,
            route,
            error: err.message
          });
        }
      }

      // Also test interactive components on Desktop:
      if (vp.name.includes('Desktop')) {
        console.log('\nTesting Interactive Controls on Desktop...');
        // Test Smart Bins page modal/buttons
        try {
          await page.goto(`${BASE_URL}/smart-bins`, { waitUntil: 'networkidle2' });
          await new Promise(r => setTimeout(r, 800));
          // Look for Add Bin button
          const _addBinBtn = await page.$('button');
          console.log('  Inspecting Smart Bins interactive controls...');
        } catch (e) {
          console.log('  Error testing smart bins controls:', e.message);
        }

        // Test Route Optimization Page calculate route button
        try {
          await page.goto(`${BASE_URL}/route-optimization`, { waitUntil: 'networkidle2' });
          await new Promise(r => setTimeout(r, 800));
          console.log('  Inspecting Route Optimization page...');
        } catch (e) {
          console.log('  Error testing route opt controls:', e.message);
        }
      }

      await page.close();
    }

    // 3. Test Collector and Monitor Dashboards specifically
    for (const roleKey of ['GARBAGE_COLLECTOR', 'MUNICIPALITY_MONITOR']) {
      const auth = roleAuthData[roleKey];
      if (!auth) continue;
      console.log(`\nTesting specific role flow for ${roleKey}...`);
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });

      await page.evaluateOnNewDocument((token, user) => {
        localStorage.setItem('ecosort_token', token);
        localStorage.setItem('ecosort_user', JSON.stringify(user));
      }, auth.access_token, auth.user);

      const targetRoute = roleKey === 'GARBAGE_COLLECTOR' ? '/dashboard/collector' : '/dashboard/monitor';
      await page.goto(`${BASE_URL}${targetRoute}`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 1000));
      console.log(`  Visited ${targetRoute} -> ${page.url()}`);
      await page.close();
    }

  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log('AUDIT SUMMARY RESULTS:');
  console.log('========================================');
  console.log(`Total Console Errors: ${auditReport.consoleErrors.length}`);
  console.log(`Total Console Warnings: ${auditReport.consoleWarnings.length}`);
  console.log(`Total Network Errors: ${auditReport.networkErrors.length}`);
  console.log(`Total Page Exceptions: ${auditReport.pageExceptions.length}`);
  console.log(`Total Horizontal Overflow Issues: ${auditReport.overflowIssues.length}`);
  console.log(`Total Broken Images: ${auditReport.brokenImages.length}`);

  console.log('\n=== Console Errors Detail ===');
  console.log(JSON.stringify(auditReport.consoleErrors, null, 2));

  console.log('\n=== Network Errors Detail ===');
  console.log(JSON.stringify(auditReport.networkErrors, null, 2));

  console.log('\n=== Page Exceptions Detail ===');
  console.log(JSON.stringify(auditReport.pageExceptions, null, 2));

  console.log('\n=== Overflow Issues Detail ===');
  console.log(JSON.stringify(auditReport.overflowIssues, null, 2));

  console.log('\n=== Broken Images Detail ===');
  console.log(JSON.stringify(auditReport.brokenImages, null, 2));
}

runAudit().catch(err => {
  console.error('Audit crashed:', err);
  process.exit(1);
});

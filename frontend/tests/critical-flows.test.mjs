import test from 'node:test';
import assert from 'node:assert/strict';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

test('Critical Flow 1: Authentication & Role Verification for All 4 Personas', async (t) => {
  const accounts = [
    { role: 'SUPER_ADMIN', email: 'superadmin@ecosort.ai', pass: 'Admin@123' },
    { role: 'ADMIN', email: 'admin.metro@ecosort.ai', pass: 'Admin@123' },
    { role: 'GARBAGE_COLLECTOR', email: 'collector.metro@ecosort.ai', pass: 'Admin@123' },
    { role: 'MUNICIPALITY_MONITOR', email: 'monitor.metro@ecosort.ai', pass: 'Admin@123' },
  ];

  for (const acc of accounts) {
    await t.test(`Login as ${acc.role}`, async () => {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: acc.email, password: acc.pass })
      });

      assert.equal(res.status, 200, `Expected 200 OK for ${acc.email}`);
      const data = await res.json();
      assert.ok(data.access_token, 'access_token should be returned');
      assert.equal(data.user.role, acc.role, `User role should be ${acc.role}`);
      assert.equal(data.user.email, acc.email, 'User email should match');
    });
  }

  await t.test('Reject invalid password with 401 Unauthorized', async () => {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@ecosort.ai', password: 'WrongPassword999!' })
    });
    assert.equal(res.status, 401, 'Invalid password must return 401');
  });
});

test('Critical Flow 2: Smart Bins Telemetry Retrieval & Structure', async () => {
  // Login first as ADMIN
  const authRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin.metro@ecosort.ai', password: 'Admin@123' })
  });
  const { access_token } = await authRes.json();

  const res = await fetch(`${BACKEND_URL}/api/bins`, {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });
  assert.equal(res.status, 200, 'Smart bins list endpoint should return 200');
  const bins = await res.json();
  assert.ok(Array.isArray(bins), 'Bins response must be an array');
  assert.ok(bins.length > 0, 'Database should contain registered smart bins');

  const firstBin = bins[0];
  assert.ok(firstBin.id, 'Bin should have an id');
  assert.ok(firstBin.bin_code, 'Bin should have a bin_code');
  assert.ok(typeof firstBin.fill_level === 'number', 'Bin fill_level should be a number');
  assert.ok(typeof firstBin.latitude === 'number', 'Bin latitude should be numeric');
  assert.ok(typeof firstBin.longitude === 'number', 'Bin longitude should be numeric');
});

test('Critical Flow 3: Citizen Grievance Submission Flow', async () => {
  const newComplaint = {
    title: 'Automated E2E Test Grievance',
    description: 'Automated test citizen complaint regarding overflow on Avinashi Road corridor.',
    complaint_type: 'OVERFLOW',
    location_name: 'Peelamedu Central Test Point, Avinashi Rd',
    latitude: 11.0260,
    longitude: 77.0100,
    citizen_name: 'QA Lead Automation',
    citizen_phone: '+91 98765 43210',
    municipality_id: 1
  };

  const res = await fetch(`${BACKEND_URL}/api/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newComplaint)
  });

  assert.equal(res.status, 200, 'Grievance submission must return 200 OK');
  const created = await res.json();
  assert.ok(created.id, 'Created complaint must have an ID');
  assert.ok(created.ticket_number, 'Created complaint must receive a unique ticket_number');
  assert.ok(created.status, 'Created complaint should have a status');
});

test('Critical Flow 4: Collection Task Summary Authorization', async () => {
  // 1. Get collector token
  const authRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'collector.metro@ecosort.ai', password: 'Admin@123' })
  });
  const { access_token } = await authRes.json();

  // 2. Fetch collector summary
  const summaryRes = await fetch(`${BACKEND_URL}/api/collections/collector/summary`, {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });
  assert.equal(summaryRes.status, 200, 'Collector summary must return 200 OK for authorized collector');
  const summary = await summaryRes.json();
  assert.ok('tasks_assigned_today' in summary, 'Summary must include tasks_assigned_today');
  assert.ok('tasks_completed_today' in summary, 'Summary must include tasks_completed_today');
});

test('Critical Flow 5: Health & System Diagnostics Endpoint', async () => {
  const res = await fetch(`${BACKEND_URL}/api/health`);
  assert.equal(res.status, 200, 'Health endpoint should return 200');
  const body = await res.json();
  assert.equal(body.status, 'healthy', 'Service status should be healthy');
});

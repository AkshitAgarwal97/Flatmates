// Simple end-to-end smoke test for backend API
// Requires Node 18+ (global fetch)

(async () => {
  const base = 'http://localhost:5000';
  const headers = { 'Content-Type': 'application/json' };
  const ts = Date.now();
  const email = `testuser+${ts}@example.com`;

  const log = (...args) => console.log('[SMOKE]', ...args);
  const fail = (msg) => { console.error('[SMOKE][FAIL]', msg); process.exit(1); };

  try {
    // Public: GET /api/properties
    let res = await fetch(base + '/api/properties');
    log('GET /api/properties ->', res.status);
    if (!res.ok) return fail('GET /api/properties failed');
    const listText = await res.text();
    log('properties length:', listText.length);

    // Register
    res = await fetch(base + '/api/auth/register', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Test User', email, password: 'secret123', userType: 'room_seeker' })
    });
    const regText = await res.text();
    log('POST /api/auth/register ->', res.status, regText);
    if (res.status !== 200 && res.status !== 400) return fail('Unexpected register status');

    // Login
    res = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password: 'secret123' })
    });
    const loginText = await res.text();
    log('POST /api/auth/login ->', res.status, loginText);
    if (!res.ok) return fail('Login failed');
    let token;
    try { token = JSON.parse(loginText).token; } catch (e) { return fail('No token in login response'); }

    // Private: GET /api/auth/user
    res = await fetch(base + '/api/auth/user', { headers: { Authorization: `Bearer ${token}` } });
    const meAuthText = await res.text();
    log('GET /api/auth/user ->', res.status, meAuthText);
    if (!res.ok) return fail('GET /api/auth/user failed');

    // Private: GET /api/users/me
    res = await fetch(base + '/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
    const meText = await res.text();
    log('GET /api/users/me ->', res.status, meText);
    if (!res.ok) return fail('GET /api/users/me failed');

    // Create a second user (property owner) and login
    const emailOwner = `testowner+${ts}@example.com`;
    res = await fetch(base + '/api/auth/register', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Owner User', email: emailOwner, password: 'secret123', userType: 'property_owner' })
    });
    log('POST /api/auth/register (owner) ->', res.status);
    if (res.status !== 200 && res.status !== 400) return fail('Unexpected register status for owner');

    res = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: emailOwner, password: 'secret123' })
    });
    const ownerLoginText = await res.text();
    log('POST /api/auth/login (owner) ->', res.status, ownerLoginText);
    if (!res.ok) return fail('Owner login failed');
    let ownerToken; try { ownerToken = JSON.parse(ownerLoginText).token; } catch (e) { return fail('No token in owner login response'); }

    // Get both users' profiles to fetch their IDs
    res = await fetch(base + '/api/auth/user', { headers: { Authorization: `Bearer ${token}` } });
    const userAJson = await res.json();
    if (!res.ok) return fail('GET /api/auth/user (A) failed');
    const userAId = userAJson._id;

    res = await fetch(base + '/api/auth/user', { headers: { Authorization: `Bearer ${ownerToken}` } });
    const userBJson = await res.json();
    if (!res.ok) return fail('GET /api/auth/user (owner) failed');
    const userBId = userBJson._id;

    // Owner creates a property (no images)
    const propertyPayload = {
      title: 'E2E Test Property',
      description: 'Test description',
      propertyType: 'flat',
      listingType: 'entire_property',
      address: { city: 'Test City', country: 'Testland', location: { type: 'Point', coordinates: [0, 0] } },
      price: { amount: 1200 },
      availability: { availableFrom: new Date().toISOString() }
    };
    res = await fetch(base + '/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify(propertyPayload)
    });
    const propertyText = await res.text();
    log('POST /api/properties ->', res.status, propertyText);
    if (!res.ok) return fail('Create property failed');
    let property; try { property = JSON.parse(propertyText); } catch (e) { return fail('Invalid property JSON'); }
    const propertyId = property._id;

    // Public fetch of property by id
    res = await fetch(base + `/api/properties/${propertyId}`);
    log('GET /api/properties/:id ->', res.status);
    if (!res.ok) return fail('GET property by id failed');

    // User A saves the property
    res = await fetch(base + `/api/properties/${propertyId}/save`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const saveText = await res.text();
    log('POST /api/properties/:id/save ->', res.status, saveText);
    if (!res.ok) return fail('Save property failed');

    // Messaging: A creates conversation with owner about the property
    const convoPayload = {
      recipient: userBId,
      property: propertyId,
      initialMessage: 'Hi, I am interested in your property.'
    };
    res = await fetch(base + '/api/messages/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(convoPayload)
    });
    const convoText = await res.text();
    log('POST /api/messages/conversations ->', res.status, convoText);
    if (!res.ok) return fail('Create conversation failed');
    let convo; try { convo = JSON.parse(convoText); } catch (e) { return fail('Invalid conversation JSON'); }

    // A sends follow-up message in the conversation
    res = await fetch(base + `/api/messages/conversations/${convo._id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: 'When is a good time to view?' })
    });
    const msgText = await res.text();
    log('POST /api/messages/conversations/:id ->', res.status, msgText);
    if (!res.ok) return fail('Send message failed');

    // A lists conversations
    res = await fetch(base + '/api/messages/conversations', { headers: { Authorization: `Bearer ${token}` } });
    const convosText = await res.text();
    log('GET /api/messages/conversations ->', res.status);
    if (!res.ok) return fail('List conversations failed');

    // A fetches messages for conversation
    res = await fetch(base + `/api/messages/conversations/${convo._id}`, { headers: { Authorization: `Bearer ${token}` } });
    log('GET /api/messages/conversations/:id ->', res.status);
    if (!res.ok) return fail('Get conversation messages failed');

    log('SMOKE TEST PASSED');
    process.exit(0);
  } catch (err) {
    console.error('E2E test error:', err);
    process.exit(1);
  }
})();
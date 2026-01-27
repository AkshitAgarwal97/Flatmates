// Simple end-to-end smoke test for backend API
// Requires Node 18+ (global fetch)
const CryptoJS = require('crypto-js');

(async () => {
  const base = 'http://localhost:5000';
  const headers = { 'Content-Type': 'application/json' };
  const ts = Date.now();
  const email = `testuser+${ts}@example.com`;

  // Use the default key if not in env
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "flatmates_secure_key_123";

  const encrypt = (text) => {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  };

  const log = (...args) => console.log('[SMOKE]', ...args);
  const fail = (msg, err) => {
    console.error('[SMOKE][FAIL]', msg);
    if (err) {
      console.error('[SMOKE][ERROR_DETAILS]', err);
      if (err.stack) console.error('[SMOKE][STACK]', err.stack);
    }
    process.exit(1);
  };

  try {
    // Public: GET /api/properties
    log('Starting GET /api/properties...');
    let res = await fetch(base + '/api/properties');
    log('GET /api/properties ->', res.status);
    if (!res.ok) return fail('GET /api/properties failed');
    const propertiesData = await res.json();
    log('properties count:', propertiesData.properties?.length || 0);

    // Register
    log('Starting Registration...');
    res = await fetch(base + '/api/auth/register', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Test User',
        email,
        password: encrypt('secret123'),
        userType: 'room_seeker'
      })
    });
    const regText = await res.text();
    log('POST /api/auth/register ->', res.status);
    if (res.status !== 200 && res.status !== 400) return fail('Unexpected register status: ' + regText);

    // Login
    log('Starting Login...');
    res = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        password: encrypt('secret123')
      })
    });
    const loginText = await res.text();
    log('POST /api/auth/login ->', res.status);
    if (!res.ok) return fail('Login failed: ' + loginText);

    let token;
    try {
      const loginJson = JSON.parse(loginText);
      token = loginJson.token;
    } catch (e) {
      return fail('No token in login response', e);
    }
    if (!token) return fail('Token is undefined in response');

    // Private: GET /api/auth/user
    res = await fetch(base + '/api/auth/user', { headers: { Authorization: `Bearer ${token}` } });
    log('GET /api/auth/user ->', res.status);
    if (!res.ok) return fail('GET /api/auth/user failed: ' + await res.text());

    // Create a second user (property owner) and login
    const emailOwner = `testowner+${ts}@example.com`;
    log('Registering owner...');
    res = await fetch(base + '/api/auth/register', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Owner User',
        email: emailOwner,
        password: encrypt('secret123'),
        userType: 'property_owner'
      })
    });
    if (res.status !== 200 && res.status !== 400) return fail('Unexpected register status for owner');

    log('Logging in owner...');
    res = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: emailOwner,
        password: encrypt('secret123')
      })
    });
    const ownerLoginJson = await res.json();
    if (!res.ok) return fail('Owner login failed');
    let ownerToken = ownerLoginJson.token;

    // Get both users' profiles to fetch their IDs
    res = await fetch(base + '/api/auth/user', { headers: { Authorization: `Bearer ${token}` } });
    const userAJson = await res.json();
    const userAId = userAJson._id || userAJson.id;

    res = await fetch(base + '/api/auth/user', { headers: { Authorization: `Bearer ${ownerToken}` } });
    const userBJson = await res.json();
    const userBId = userBJson._id || userBJson.id;

    // Owner creates a property
    log('Creating property...');
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
    const propertyJson = await res.json();
    if (!res.ok) return fail('Create property failed', propertyJson);
    const propertyId = propertyJson._id || propertyJson.id;

    // User A saves the property
    log('Saving property...');
    res = await fetch(base + `/api/properties/${propertyId}/save`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return fail('Save property failed: ' + await res.text());

    // Messaging: A creates conversation with owner about the property
    log('Creating conversation...');
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
    const convoJson = await res.json();
    log('POST /api/messages/conversations ->', res.status);
    if (!res.ok) return fail('Create conversation failed', convoJson);

    const convoId = convoJson._id || convoJson.id;
    if (!convoId) return fail('No ID in conversation response', convoJson);

    // A sends follow-up message in the conversation
    log('Sending message...');
    res = await fetch(base + `/api/messages/conversations/${convoId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: 'When is a good time to view?' })
    });
    const sendMsgResult = await res.text();
    log('POST /api/messages/conversations/:id ->', res.status);
    if (!res.ok) return fail('Send message failed: ' + sendMsgResult);

    // A fetches messages for conversation
    log('Fetching messages...');
    res = await fetch(base + `/api/messages/conversations/${convoId}`, { headers: { Authorization: `Bearer ${token}` } });
    log('GET /api/messages/conversations/:id ->', res.status);
    if (!res.ok) return fail('Get messages failed: ' + await res.text());

    log('SMOKE TEST PASSED');
    process.exit(0);
  } catch (err) {
    fail('Unexpected exception during smoke test', err);
  }
})();
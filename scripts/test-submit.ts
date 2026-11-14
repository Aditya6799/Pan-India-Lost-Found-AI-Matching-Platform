async function testSubmit() {
  const base = 'http://localhost:3000';
  
  // 1. Get CSRF token and cookie
  const csrfRes = await fetch(base + '/api/auth/csrf');
  const csrfData = await csrfRes.json();
  const csrfCookies = csrfRes.headers.getSetCookie();

  // 2. Sign in as Citizen Rahul Sharma with manual redirect
  const loginRes = await fetch(base + '/api/auth/callback/credentials', {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': csrfCookies.map(c => c.split(';')[0]).join('; '),
    },
    body: new URLSearchParams({
      csrfToken: csrfData.csrfToken,
      email: 'rahul.sharma@example.com',
      password: 'User@12345',
      callbackUrl: base + '/en',
    }),
  });

  const sessionCookies = loginRes.headers.getSetCookie();
  console.log('Session cookies from login:', sessionCookies.map(c => c.split(';')[0]));
  const cookieHeader = sessionCookies.map(c => c.split(';')[0]).join('; ');

  // 3. Post to /api/reports
  const submitRes = await fetch(base + '/api/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    },
    body: JSON.stringify({
      reportType: 'LOST',
      itemName: 'Fastrack Reflex Beat Smartwatch',
      category: 'Electronics',
      subcategory: 'Smartwatch',
      description: 'Black Fastrack Reflex smartwatch with black silicone strap. Has a small surface scratch on the charging pin area. Lost near Kashmere Gate metro station platform 2.',
      brand: 'Fastrack',
      color: ['Black'],
      distinctiveFeatures: 'Scratch on magnetic pin, black buckle.',
      state: 'Delhi',
      city: 'New Delhi',
      locality: 'Kashmere Gate Metro Station',
      lostFoundDate: '2026-11-14',
      contactPreference: 'email',
    }),
  });

  console.log('POST /api/reports status:', submitRes.status, submitRes.statusText);
  const data = await submitRes.json();
  console.log('API Response:', JSON.stringify(data));
}

testSubmit().catch(e => console.error(e));

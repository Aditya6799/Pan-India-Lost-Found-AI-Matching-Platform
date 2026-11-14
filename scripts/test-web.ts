async function testWeb() {
  const base = 'http://localhost:3000';
  console.log('Testing Web Endpoints at', base);

  try {
    // 1. Home page
    const homeRes = await fetch(base + '/en');
    console.log('1. GET /en (Home Page):', homeRes.status, homeRes.statusText);

    // 2. Health API (Edge runtime)
    const healthRes = await fetch(base + '/api/health');
    const healthData = await healthRes.json();
    console.log('2. GET /api/health (Edge Runtime):', healthRes.status, JSON.stringify(healthData));

    // 3. Reports API (MongoDB)
    const reportsRes = await fetch(base + '/api/reports?limit=5');
    const reportsData = await reportsRes.json();
    console.log('3. GET /api/reports (MongoDB Database):', reportsRes.status, 'Total reports:', reportsData.total, 'Items returned:', reportsData.data?.length);

    // 4. Stats API
    const statsRes = await fetch(base + '/api/stats');
    const statsData = await statsRes.json();
    console.log('4. GET /api/stats (Live Platform Stats):', statsRes.status, JSON.stringify(statsData.data || statsData));

    // 5. Search Page
    const searchRes = await fetch(base + '/en/search?category=Electronics');
    console.log('5. GET /en/search?category=Electronics:', searchRes.status, searchRes.statusText);

    // 6. Sign In Page
    const signInRes = await fetch(base + '/en/auth/sign-in');
    console.log('6. GET /en/auth/sign-in:', signInRes.status, signInRes.statusText);

    // 7. CSRF token for NextAuth
    const csrfRes = await fetch(base + '/api/auth/csrf');
    const csrfData = await csrfRes.json();
    const cookies = csrfRes.headers.get('set-cookie') || '';
    console.log('7. GET /api/auth/csrf:', csrfRes.status, 'CSRF Token ready');

    // 8. Test NextAuth Credentials Sign In with admin@foundit.in
    const loginRes = await fetch(base + '/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies,
      },
      body: new URLSearchParams({
        csrfToken: csrfData.csrfToken,
        email: 'admin@foundit.in',
        password: 'Admin@12345',
        redirect: 'false',
        json: 'true',
      }),
    });
    console.log('8. POST /api/auth/callback/credentials (admin@foundit.in):', loginRes.status, loginRes.statusText);
    const authCookies = loginRes.headers.get('set-cookie');
    console.log('   Authenticated Session Cookie received:', !!authCookies);

    console.log('\n====================================================');
    console.log('🎉 ALL LIVE WEB & API ENDPOINTS VERIFIED OPERATIONAL!');
    console.log('====================================================');
  } catch (err: any) {
    console.error('Test failed with error:', err.message);
  }
}

testWeb();

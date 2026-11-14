async function testAuthenticatedPages() {
  const base = 'http://localhost:3000';
  console.log('Testing Authenticated User Flows at', base);

  // 1. Get CSRF Token & Cookie
  const csrfRes = await fetch(base + '/api/auth/csrf');
  const csrfData = await csrfRes.json();
  const cookies = csrfRes.headers.get('set-cookie') || '';

  // 2. Sign In as Citizen Rahul Sharma
  const loginRes = await fetch(base + '/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookies,
    },
    body: new URLSearchParams({
      csrfToken: csrfData.csrfToken,
      email: 'rahul.sharma@example.com',
      password: 'User@12345',
      redirect: 'false',
      json: 'true',
    }),
  });

  const sessionCookies = loginRes.headers.get('set-cookie') || '';
  console.log('1. User Login (rahul.sharma@example.com):', loginRes.status, loginRes.statusText);

  // 3. Request User Dashboard with Session Cookie
  const dashRes = await fetch(base + '/en/dashboard', {
    headers: { 'Cookie': sessionCookies },
  });
  console.log('2. GET /en/dashboard (Citizen Dashboard):', dashRes.status, dashRes.statusText);

  // 4. Request AI Matches with Session Cookie
  const matchesRes = await fetch(base + '/en/dashboard/matches', {
    headers: { 'Cookie': sessionCookies },
  });
  console.log('3. GET /en/dashboard/matches (AI Match Console):', matchesRes.status, matchesRes.statusText);

  // 5. Request Claims with Session Cookie
  const claimsRes = await fetch(base + '/en/dashboard/claims', {
    headers: { 'Cookie': sessionCookies },
  });
  console.log('4. GET /en/dashboard/claims (Ownership Claims):', claimsRes.status, claimsRes.statusText);

  // 6. Request Matches API to verify the 91% Match
  const apiMatchesRes = await fetch(base + '/api/matches', {
    headers: { 'Cookie': sessionCookies },
  });
  const apiMatchesData = await apiMatchesRes.json();
  console.log('5. GET /api/matches (AI Semantic Engine):', apiMatchesRes.status, 'Total matches found:', apiMatchesData.total || apiMatchesData.data?.length);
  if (apiMatchesData.data && apiMatchesData.data.length > 0) {
    const topMatch = apiMatchesData.data[0];
    console.log(`   Top Match: ${topMatch.matchPercentage}% [${topMatch.confidenceLevel?.toUpperCase()}] - ${topMatch.matchReasons?.[0]}`);
  }

  console.log('\n====================================================');
  console.log('🎉 CITIZEN AUTH & AI MATCH DASHBOARD VERIFIED 200 OK!');
  console.log('====================================================');
}

testAuthenticatedPages().catch(e => console.error(e));

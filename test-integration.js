// Comprehensive integration test for Enhanced Habit Tracker
async function runTests() {
    const BASE_URL = 'http://localhost:3000';
    let passed = 0;
    let failed = 0;

    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║   ENHANCED HABIT TRACKER - INTEGRATION TESTS     ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // Test 1: Landing Page
    console.log('1. Testing Landing Page...');
    try {
        const res = await fetch(BASE_URL);
        const html = await res.text();
        const hasHero = html.includes('Master Your Habits') || html.includes('HabitFlow');
        console.log(`   Status: ${res.status} | Has Hero: ${hasHero ? '✅' : '❌'}`);
        if (res.ok && hasHero) passed++; else failed++;
    } catch (e) { console.log('   ❌ FAILED:', e.message); failed++; }

    // Test 2: Login Page
    console.log('2. Testing Login Page...');
    try {
        const res = await fetch(`${BASE_URL}/login`);
        console.log(`   Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
        if (res.ok) passed++; else failed++;
    } catch (e) { console.log('   ❌ FAILED:', e.message); failed++; }

    // Test 3: Register Page
    console.log('3. Testing Register Page...');
    try {
        const res = await fetch(`${BASE_URL}/register`);
        console.log(`   Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
        if (res.ok) passed++; else failed++;
    } catch (e) { console.log('   ❌ FAILED:', e.message); failed++; }

    // Test 4: Dashboard (should redirect or load)
    console.log('4. Testing Dashboard Page...');
    try {
        const res = await fetch(`${BASE_URL}/dashboard`);
        console.log(`   Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
        if (res.ok) passed++; else failed++;
    } catch (e) { console.log('   ❌ FAILED:', e.message); failed++; }

    // Test 5: Registration API
    console.log('5. Testing Registration API...');
    const email = `test_${Date.now()}@test.com`;
    try {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test', email, password: 'password123' }),
        });
        const data = await res.json();
        console.log(`   Status: ${res.status} ${res.status === 201 ? '✅' : '⚠️'}`);
        if (res.status === 201) passed++; else failed++;
    } catch (e) { console.log('   ❌ FAILED:', e.message); failed++; }

    // Test 6: Calendar API (Unauthorized expected)
    console.log('6. Testing Calendar API (unauth)...');
    try {
        const res = await fetch(`${BASE_URL}/api/calendar?month=2026-01`);
        console.log(`   Status: ${res.status} ${res.status === 401 ? '✅ (expected)' : '⚠️'}`);
        if (res.status === 401) passed++; else failed++;
    } catch (e) { console.log('   ❌ FAILED:', e.message); failed++; }

    // Test 7: Stats API (Unauthorized expected)
    console.log('7. Testing Stats API (unauth)...');
    try {
        const res = await fetch(`${BASE_URL}/api/stats`);
        console.log(`   Status: ${res.status} ${res.status === 401 ? '✅ (expected)' : '⚠️'}`);
        if (res.status === 401) passed++; else failed++;
    } catch (e) { console.log('   ❌ FAILED:', e.message); failed++; }

    // Test 8: Goals API (Unauthorized expected)
    console.log('8. Testing Goals API (unauth)...');
    try {
        const res = await fetch(`${BASE_URL}/api/goals`);
        console.log(`   Status: ${res.status} ${res.status === 401 ? '✅ (expected)' : '⚠️'}`);
        if (res.status === 401) passed++; else failed++;
    } catch (e) { console.log('   ❌ FAILED:', e.message); failed++; }

    // Summary
    console.log('\n══════════════════════════════════════════════════');
    console.log(`RESULTS: ${passed} passed, ${failed} failed`);
    console.log(`SUCCESS RATE: ${Math.round((passed / (passed + failed)) * 100)}%`);
    console.log('══════════════════════════════════════════════════');

    if (failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Application is ready for use.');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the output above.');
    }
}

runTests().catch(console.error);

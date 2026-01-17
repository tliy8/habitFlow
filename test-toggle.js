// Test script for habit toggle functionality
const BASE_URL = 'http://localhost:3000';

async function testHabitToggle() {
    console.log('=== HABIT TOGGLE TEST ===\n');

    // Step 1: Register a test user
    const email = `test_toggle_${Date.now()}@test.com`;
    console.log('1. Registering test user:', email);

    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Toggle Test',
            email,
            password: 'password123'
        }),
    });

    if (!registerRes.ok) {
        console.log('   ❌ Registration failed:', registerRes.status);
        const text = await registerRes.text();
        console.log('   Response:', text.slice(0, 200));
        return;
    }

    const regData = await registerRes.json();
    console.log('   ✅ Registered, user ID:', regData.data?.user?.id || 'unknown');

    // Step 2: Login to get session
    console.log('\n2. Logging in...');

    // Get CSRF token first
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    console.log('   CSRF token obtained');

    // Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            email,
            password: 'password123',
            csrfToken,
            json: 'true',
        }),
        redirect: 'manual',
    });

    // Get cookies from login response
    const cookies = loginRes.headers.get('set-cookie') || '';
    console.log('   Login status:', loginRes.status);
    console.log('   Got cookies:', cookies.length > 0 ? 'Yes' : 'No');

    if (!cookies) {
        console.log('   ⚠️ No session cookies received');
    }

    // Step 3: Create a habit
    console.log('\n3. Creating a habit...');

    const createRes = await fetch(`${BASE_URL}/api/habits`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies,
        },
        body: JSON.stringify({ name: 'Test Toggle Habit' }),
    });

    console.log('   Create habit status:', createRes.status);
    const createData = await createRes.json();
    console.log('   Response:', JSON.stringify(createData).slice(0, 200));

    if (!createRes.ok) {
        console.log('   ❌ Failed to create habit');
        return;
    }

    const habitId = createData.data?.id;
    console.log('   ✅ Habit created, ID:', habitId);

    // Step 4: Toggle the habit
    console.log('\n4. Toggling habit completion...');

    const toggleRes = await fetch(`${BASE_URL}/api/habits/${habitId}/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies,
        },
        body: JSON.stringify({ isBackfill: false }),
    });

    console.log('   Toggle status:', toggleRes.status);
    const toggleData = await toggleRes.json();
    console.log('   Response:', JSON.stringify(toggleData));

    if (toggleRes.ok && toggleData.data?.completed === true) {
        console.log('\n   ✅✅✅ TOGGLE WORKS! Habit marked as completed.');
    } else {
        console.log('\n   ❌❌❌ TOGGLE FAILED');
        console.log('   Full response:', JSON.stringify(toggleData, null, 2));
    }

    // Step 5: Toggle again (uncomplete)
    console.log('\n5. Toggling again (uncomplete)...');

    const toggle2Res = await fetch(`${BASE_URL}/api/habits/${habitId}/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies,
        },
        body: JSON.stringify({ isBackfill: false }),
    });

    console.log('   Toggle status:', toggle2Res.status);
    const toggle2Data = await toggle2Res.json();
    console.log('   Response:', JSON.stringify(toggle2Data));

    if (toggle2Res.ok && toggle2Data.data?.completed === false) {
        console.log('\n   ✅✅✅ UNTOGGLE WORKS! Habit marked as not completed.');
    }

    console.log('\n=== TEST COMPLETE ===');
}

testHabitToggle().catch(console.error);

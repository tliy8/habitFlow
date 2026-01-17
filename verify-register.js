// Native fetch is available in Node 18+
async function verifyRegistration() {
    console.log("Testing Registration API...");
    try {
        const userEmail = `test_${Date.now()}@example.com`;
        console.log(`Creating user: ${userEmail}`);

        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test User",
                email: userEmail,
                password: "password123"
            })
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${JSON.stringify(data, null, 2)}`);

        if (response.ok) {
            console.log("✅ VERIFICATION SUCCESS: Registration endpoint is working.");
        } else {
            console.error("❌ VERIFICATION FAILED: API returned error.");
            process.exit(1);
        }
    } catch (error) {
        console.error("❌ CONNECTION FAILED:", error.message);
        process.exit(1);
    }
}

// Simple delay to ensure server is ready
setTimeout(verifyRegistration, 3000);

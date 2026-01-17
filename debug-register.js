async function debugRegistration() {
    console.log("Debugging Registration API...");
    try {
        const userEmail = `test_${Date.now()}@example.com`;
        console.log(`Creating user: ${userEmail}`);

        // Using port 3001 as per your latest console log
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test User",
                email: userEmail,
                password: "password123"
            })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        const text = await response.text();
        // Print first 500 chars of response to see the error message
        console.log("Response Body (Truncated):");
        console.log(text.substring(0, 1000));

    } catch (error) {
        console.error("❌ CONNECTION FAILED:", error.message);
    }
}

debugRegistration();

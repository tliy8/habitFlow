
import { db } from "./lib/db";
import { HabitService } from "./services/habit.service";

async function testServiceLayer() {
    console.log("🧪 STARTING SERVICE LAYER TEST...");

    try {
        // 1. Create a Test User
        const email = `service_test_${Date.now()}@test.com`;
        const user = await db.user.create({
            data: {
                email,
                password: "hashed_password",
                name: "Service Tester",
            },
        });
        console.log("✅ User created:", user.id);

        // 2. Create a Test Habit
        const habit = await HabitService.createHabit(user.id, {
            name: "Test Toggle Habit",
            frequency: "daily",
            color: "#10b981",
        });
        console.log("✅ Habit created:", habit.id);

        // 3. Test Toggle ON (isBackfill: false)
        console.log("👉 Toggling ON (isBackfill: false)...");
        const result1 = await HabitService.toggleCompletion(
            user.id,
            habit.id,
            new Date(),
            false // isBackfill
        );
        console.log("   Result:", result1);

        if (result1.completed !== true) throw new Error("Expected completed: true");
        if (result1.isBackfill !== false) throw new Error("Expected isBackfill: false");

        // Verify in DB
        const completion1 = await db.habitCompletion.findFirst({
            where: { habitId: habit.id }
        });
        if (!completion1) throw new Error("Completion not found in DB");
        if (completion1.isBackfill !== false) throw new Error("DB record isBackfill mismatch");
        console.log("✅ Toggle ON verified in DB");

        // 4. Test Toggle OFF
        console.log("👉 Toggling OFF...");
        const result2 = await HabitService.toggleCompletion(
            user.id,
            habit.id,
            new Date(),
            false
        );
        console.log("   Result:", result2);

        if (result2.completed !== false) throw new Error("Expected completed: false");

        // Verify in DB
        const completion2 = await db.habitCompletion.findFirst({
            where: { habitId: habit.id }
        });
        if (completion2) throw new Error("Completion should be deleted from DB");
        console.log("✅ Toggle OFF verified in DB");

        // 5. Cleanup
        await db.user.delete({ where: { id: user.id } });
        console.log("✅ Cleanup done");
        console.log("\n🎉 ALL SERVICE TESTS PASSED");

    } catch (error) {
        console.error("\n❌ TEST FAILED:", error);
        process.exit(1);
    }
}

testServiceLayer();

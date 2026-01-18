
import { HabitService } from "../services/habit.service";
import { db } from "../lib/db";

const USER_ID = "cmkj76gaf0000uwl0j48lvufc";

async function verify() {
    console.log("🚀 Starting Core Verification...");

    try {
        // 1. CREATE
        console.log("\n1. Testing Create...");
        const habit = await HabitService.createHabit(USER_ID, {
            name: "TEST_HABIT_" + Date.now(),
            frequency: "daily",
            color: "red"
        });

        if (!habit || !habit.id) throw new Error("Creation failed: No habit returned");
        console.log("✅ Created Habit:", habit.id, habit.name);

        // 2. TOGGLE (COMPLETE)
        console.log("\n2. Testing Toggle (Check)...");
        const checkResult = await HabitService.toggleCompletion(USER_ID, habit.id);
        if (!checkResult.completed) throw new Error("Toggle (Check) failed: returned false");
        console.log("✅ Toggled ON");

        // 3. VERIFY DB STATE
        const completion = await db.habitCompletion.findFirst({
            where: { habitId: habit.id }
        });
        if (!completion) throw new Error("Toggle (Check) failed: No DB record found");
        console.log("✅ DB Record found:", completion.date);

        // 4. TOGGLE (UNCOMPLETE)
        console.log("\n4. Testing Toggle (Uncheck)...");
        const uncheckResult = await HabitService.toggleCompletion(USER_ID, habit.id);
        if (uncheckResult.completed) throw new Error("Toggle (Uncheck) failed: returned true");
        console.log("✅ Toggled OFF");

        // 5. CLEANUP
        console.log("\n5. Cleanup...");
        await HabitService.deleteHabit(USER_ID, habit.id);
        console.log("✅ Deleted Test Habit");

        console.log("\n🎉 CORE BACKEND IS WORKING PERFECTLY");

    } catch (error) {
        console.error("\n❌ VERIFICATION FAILED:", error);
        process.exit(1);
    }
}

verify();

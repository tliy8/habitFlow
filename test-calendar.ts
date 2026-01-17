// Comprehensive Calendar Logic Test
// Tests: Create habits, backfill past days, verify streaks

import { db } from "./lib/db";
import { HabitService } from "./services/habit.service";
import { subDays, format } from "date-fns";

async function testCalendarLogic() {
    console.log("═══════════════════════════════════════════");
    console.log("   CALENDAR LOGIC TEST - FULL VERIFICATION");
    console.log("═══════════════════════════════════════════\n");

    try {
        // 1. Create a test user
        const email = `cal_test_${Date.now()}@test.com`;
        const user = await db.user.create({
            data: {
                email,
                password: "hashed",
                name: "Calendar Tester",
            },
        });
        console.log("✅ User created:", user.id);

        // 2. Create 2 test habits
        const habit1 = await HabitService.createHabit(user.id, {
            name: "Morning Run",
            frequency: "daily",
            color: "#10b981",
        });
        console.log("✅ Habit 1 created:", habit1.name);

        const habit2 = await HabitService.createHabit(user.id, {
            name: "Read Book",
            frequency: "daily",
            color: "#3b82f6",
        });
        console.log("✅ Habit 2 created:", habit2.name);

        // 3. Complete today's habits (should count for streak)
        console.log("\n--- TEST: Complete habits TODAY (should affect streak) ---");
        const today = new Date();

        const result1 = await HabitService.toggleCompletion(
            user.id,
            habit1.id,
            today,
            false // isBackfill = false (today's completion)
        );
        console.log("Today completion result:", result1);

        // Verify streak
        let habits = await HabitService.getHabits(user.id);
        let habit1Data = habits.find((h) => h.id === habit1.id);
        console.log("Habit 1 streak after today completion:", habit1Data?.streak);

        if (habit1Data?.streak?.current === 1) {
            console.log("✅ Streak correctly updated to 1");
        } else {
            console.log("❌ FAILED: Streak should be 1, got:", habit1Data?.streak?.current);
        }

        // 4. Backfill past days (should NOT affect streak)
        console.log("\n--- TEST: Backfill PAST days (should NOT affect streak) ---");

        const yesterday = subDays(today, 1);
        const twoDaysAgo = subDays(today, 2);

        console.log("Marking yesterday as complete (isBackfill = true)...");
        await HabitService.toggleCompletion(
            user.id,
            habit1.id,
            yesterday,
            true // isBackfill = true
        );

        console.log("Marking 2 days ago as complete (isBackfill = true)...");
        await HabitService.toggleCompletion(
            user.id,
            habit1.id,
            twoDaysAgo,
            true // isBackfill = true
        );

        // Verify streak didn't change
        habits = await HabitService.getHabits(user.id);
        habit1Data = habits.find((h) => h.id === habit1.id);
        console.log("Habit 1 streak after backfills:", habit1Data?.streak);

        if (habit1Data?.streak?.current === 1) {
            console.log("✅ Streak correctly UNCHANGED at 1 (backfills don't count)");
        } else {
            console.log("❌ FAILED: Streak should still be 1, got:", habit1Data?.streak?.current);
        }

        // 5. Check completions in DB
        console.log("\n--- TEST: Database completions verification ---");
        const completions = await db.habitCompletion.findMany({
            where: { habitId: habit1.id },
        });
        console.log("Total completions in DB:", completions.length);

        const backfillCount = completions.filter((c) => c.isBackfill).length;
        const realTimeCount = completions.filter((c) => !c.isBackfill).length;

        console.log("- Backfill completions:", backfillCount);
        console.log("- Real-time completions:", realTimeCount);

        if (backfillCount === 2 && realTimeCount === 1) {
            console.log("✅ Completions correctly tagged");
        } else {
            console.log("❌ FAILED: Expected 2 backfills, 1 real-time");
        }

        // 6. Test calendar API data structure
        console.log("\n--- TEST: Calendar data for past dates ---");
        for (const comp of completions) {
            console.log(`  ${format(comp.date, "yyyy-MM-dd")}: isBackfill=${comp.isBackfill}`);
        }

        // 7. Cleanup
        await db.user.delete({ where: { id: user.id } });
        console.log("\n✅ Cleanup done");

        console.log("\n═══════════════════════════════════════════");
        console.log("   TEST COMPLETE - ALL VERIFICATIONS DONE");
        console.log("═══════════════════════════════════════════\n");

    } catch (error) {
        console.error("\n❌ TEST FAILED WITH ERROR:", error);
        process.exit(1);
    }
}

testCalendarLogic();

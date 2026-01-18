
import { db } from "../lib/db";

async function main() {
    const user = await db.user.findFirst();
    console.log("UserID:", user?.id);
}

main();

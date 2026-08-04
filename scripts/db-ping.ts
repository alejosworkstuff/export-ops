import "dotenv/config";
import { prisma } from "../src/lib/db";

async function main() {
  const n = await prisma.user.count();
  console.log(`db_ok users=${n}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("db_fail", err);
  await prisma.$disconnect();
  process.exit(1);
});

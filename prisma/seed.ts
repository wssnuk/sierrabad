import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const hashed = await bcrypt.hash("ST1234", 10);
  await prisma.user.upsert({
    where: { username: "staff" },
    update: {},
    create: {
      username: "staff",
      password: hashed,
      name: "ผู้ดูแลระบบ",
      role: "ADMIN",
    },
  });
  console.log("สร้างบัญชีแอดมินสำเร็จ! username: staff / password: ST1234");
}

main().finally(() => prisma.$disconnect());

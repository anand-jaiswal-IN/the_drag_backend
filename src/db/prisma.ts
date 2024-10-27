import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => {
    console.log("Prisma connected successfully");
  })
  .catch((e) => {
    console.error("Prisma found error during connection : ", e);
    process.exit(1);
  });

export default prisma;

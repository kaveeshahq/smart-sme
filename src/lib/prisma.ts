import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../../generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaMssql({
    server: "localhost",
    port: 1433,
    database: "SmartSME",
    user: "sme_admin",
    password: "SmeSys@2024",
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
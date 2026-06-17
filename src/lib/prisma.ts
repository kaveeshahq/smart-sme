import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../../generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function parseConnectionString(url: string) {
  // Expected format:
  // sqlserver://HOST:PORT;database=DB;user=USER;password=PASS;encrypt=true/false;trustServerCertificate=true/false
  const [hostPart, ...paramParts] = url.replace("sqlserver://", "").split(";");
  const [host, portStr] = hostPart.split(":");

  const params: Record<string, string> = {};
  for (const part of paramParts) {
    const [key, value] = part.split("=");
    if (key && value !== undefined) {
      params[key.trim()] = value.trim();
    }
  }

  return {
    server: host,
    port: portStr ? parseInt(portStr) : 1433,
    database: params.database,
    user: params.user,
    password: params.password,
    encrypt: params.encrypt === "true",
    trustServerCertificate: params.trustServerCertificate !== "false",
  };
}

function createPrismaClient() {
  const connectionUrl = process.env.DATABASE_URL;

  if (!connectionUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const config = parseConnectionString(connectionUrl);
console.log("Parsed Prisma config:", config);
  

  const adapter = new PrismaMssql({
    server: config.server,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    options: {
      encrypt: config.encrypt,
      trustServerCertificate: config.trustServerCertificate,
    },
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
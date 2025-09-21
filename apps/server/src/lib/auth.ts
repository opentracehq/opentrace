import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import { account, session, user, verification } from "../db/schema/auth.js";

const schema = { user, session, account, verification };

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema,
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "",

  // biome-ignore lint/style/useNamingConvention: better-auth
  baseURL: process.env.BETTER_AUTH_URL || "",
});

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import { schema } from "../db/schema.js";
import { jwt } from "better-auth/plugins";
export const auth = betterAuth({
  plugins: [jwt()],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  usersTable: "user",
  baseUrl: "http://localhost:3000/api/auth/",
  jwtSecret: process.env.JWT_SECRET!,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectUri: "http://localhost:3000/api/auth/callback/google"
    },
  },

  trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
});

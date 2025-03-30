import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import { schema } from "../db/schema.js";
import { jwt } from "better-auth/plugins";
import { sendEmail } from "./mailer.js";


const FE_URL = process.env.FE_URL || "http://localhost:3001";
const BE_URL = process.env.BE_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export const auth = betterAuth({
  plugins: [jwt()],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  usersTable: "user",
  baseUrl: `${BE_URL}/api/auth/`,
  jwtSecret: JWT_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: `${BE_URL}/api/auth/callback/google`,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const callbackURL = `${FE_URL}/dashboard`;
      const updatedURL = `${BE_URL}/api/auth/verify-email?token=${token}&callbackURL=${encodeURIComponent(
        callbackURL
      )}`;

      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        url: updatedURL,
      });
    },
  },
  trustedOrigins: [BE_URL, FE_URL],
});

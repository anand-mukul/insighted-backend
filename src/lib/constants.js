export const DB_NAME = "insighted";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  domain: process.env.COOKIE_DOMAIN || undefined,
  path: "/",
};
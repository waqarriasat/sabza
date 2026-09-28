import { randomBytes } from 'crypto';

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Fallback key for signing admin sessions when AUTH_SECRET isn't set.
    // Generated once per build and baked into the server code only (lib/server/auth.js),
    // so every serverless function of a deployment shares the same key.
    SABZA_BUILD_SECRET: randomBytes(32).toString('hex'),
  },
};
export default nextConfig;

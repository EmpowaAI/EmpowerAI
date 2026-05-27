const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'https://empower-ai-gamma.vercel.app',
  'https://empowerai.onrender.com',
  'https://www.empowa.org',
  'https://empowa.org',
  'https://empowa-ai.co.za',
  'https://www.empowa-ai.co.za',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

// Allows Vercel preview deploys (auto-generated `*.vercel.app` URLs per
// PR or branch) without listing each one.
//
// This uses `hostname.endsWith('.vercel.app')` rather than
// `origin.includes('vercel.app')`. `includes` is a substring match and
// also accepts URLs like:
//
//   https://vercel.app.attacker.com    (hostname: vercel.app.attacker.com)
//   https://evil-vercel.app.com        (hostname: evil-vercel.app.com)
//
// The hostname-suffix form, with the leading dot, only matches a real
// subdomain of `vercel.app`. `vercel.app.attacker.com` ends in `.com`,
// so it does not match.
function isVercelPreview(origin) {
  try {
    return new URL(origin).hostname.endsWith('.vercel.app');
  } catch {
    // `new URL()` throws on a malformed origin. That counts as not allowed.
    return false;
  }
}

// Opt-in dev flag for local testing (e.g. through ngrok or a tunnel).
//
// This replaces the earlier `process.env.NODE_ENV !== 'production'`
// clause, which opened the allow-list to every origin whenever
// `NODE_ENV` was anything other than the exact string `'production'`
// (unset, typo, `development`, etc.).
//
// `ALLOW_ANY_ORIGIN_DEV` defaults to `false`, so a missing env var
// keeps the allow-list closed.
const allowAnyOriginDev = process.env.ALLOW_ANY_ORIGIN_DEV === 'true';

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowed =
      // Dev flag, only true when `ALLOW_ANY_ORIGIN_DEV=true`.
      allowAnyOriginDev ||
      allowedOrigins.indexOf(origin) !== -1 ||
      // Hostname-suffix match for Vercel preview URLs (see `isVercelPreview`).
      isVercelPreview(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

module.exports = corsOptions;

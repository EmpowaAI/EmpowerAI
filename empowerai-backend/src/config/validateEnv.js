/**
 * validateEnv.js — fail fast with actionable errors when required
 * environment variables are missing. Runs before any module that
 * connects to external services.
 */

const REQUIRED = [
  {
    name: 'SUPABASE_URL',
    hint: 'Project URL from Supabase → Settings → API (https://<ref>.supabase.co)',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    hint: 'service_role key from Supabase → Settings → API (never the anon key)',
  },
  {
    name: 'DATA_ENCRYPTION_KEY',
    hint: '64-char hex key for at-rest encryption. Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
  },
];

const RECOMMENDED = [
  { name: 'BREVO_API_KEY', feature: 'transactional email (verification, password reset)' },
  { name: 'FRONTEND_URL', feature: 'links inside outgoing emails' },
  { name: 'AI_SERVICE_URL', feature: 'CV analysis, interview coach, twin chat' },
  { name: 'AI_SERVICE_TOKEN', feature: 'authenticating requests to the AI service' },
  { name: 'PAYSTACK_SECRET_KEY', feature: 'subscription payments' },
  { name: 'ADZUNA_APP_ID', feature: 'job opportunity ingestion' },
  { name: 'ADZUNA_APP_KEY', feature: 'job opportunity ingestion' },
];

function validateEnv() {
  const missing = REQUIRED.filter((v) => !process.env[v.name]);

  if (missing.length > 0) {
    /* eslint-disable no-console */
    console.error('\n══════════════════════════════════════════════════════════');
    console.error('  STARTUP FAILED — missing required environment variables');
    console.error('══════════════════════════════════════════════════════════');
    for (const v of missing) {
      console.error(`\n  ✗ ${v.name}`);
      console.error(`    ${v.hint}`);
    }
    console.error('\n  Copy .env.example to .env and fill in real values.');
    console.error('  On Render, set these under Environment → Environment Variables.\n');
    /* eslint-enable no-console */
    process.exit(1);
  }

  const warnings = RECOMMENDED.filter((v) => !process.env[v.name]);
  for (const v of warnings) {
    // logger not loaded yet at this point — console is intentional
    // eslint-disable-next-line no-console
    console.warn(`[env] ${v.name} is not set — ${v.feature} will be unavailable.`);
  }
}

module.exports = { validateEnv };

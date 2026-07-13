/**
 * cleanup-users.js
 *
 * Lists all Supabase auth users and deletes everyone EXCEPT the
 * KEEP_EMAIL address. All user data cascades automatically:
 *   auth.users → public.users → cv_profiles, economic_twins,
 *                                subscriptions, usages, applications
 *
 * Usage (from empowerai-backend/):
 *   Dry run (safe — no deletions):
 *     node scripts/cleanup-users.js
 *
 *   Actually delete:
 *     node scripts/cleanup-users.js --execute
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your env.
 * Copy .env or export them before running.
 */

'use strict';

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const KEEP_EMAIL = 'nene171408@gmail.com';
const EXECUTE    = process.argv.includes('--execute');

// ── Supabase client ───────────────────────────────────────────────────────────
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n=== EmpowerAI User Cleanup ===`);
  console.log(`Keeping:  ${KEEP_EMAIL}`);
  console.log(`Mode:     ${EXECUTE ? 'EXECUTE (will delete)' : 'DRY RUN (no changes)'}\n`);

  // List all auth users (paginated)
  let allUsers = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) { console.error('Failed to list users:', error.message); process.exit(1); }
    allUsers.push(...(data.users || []));
    if (!data.users || data.users.length < 1000) break;
    page++;
  }

  console.log(`Total auth users found: ${allUsers.length}`);

  const toKeep   = allUsers.filter(u => u.email?.toLowerCase() === KEEP_EMAIL.toLowerCase());
  const toDelete = allUsers.filter(u => u.email?.toLowerCase() !== KEEP_EMAIL.toLowerCase());

  console.log(`\nWill KEEP (${toKeep.length}):`);
  for (const u of toKeep) {
    console.log(`  ✓  ${u.email}  [${u.id}]  created: ${u.created_at?.slice(0, 10)}`);
  }

  console.log(`\nWill DELETE (${toDelete.length}):`);
  for (const u of toDelete) {
    console.log(`  ✗  ${u.email || '(no email)'}  [${u.id}]  created: ${u.created_at?.slice(0, 10)}`);
  }

  if (toDelete.length === 0) {
    console.log('\nNothing to delete. Database is already clean.');
    return;
  }

  if (!EXECUTE) {
    console.log(`\n--- DRY RUN complete — no changes made ---`);
    console.log(`Run with --execute to perform the deletions:\n`);
    console.log(`  node scripts/cleanup-users.js --execute\n`);
    return;
  }

  // ── Execute deletions ───────────────────────────────────────────────────────
  console.log('\nDeleting...');
  let deleted = 0;
  let failed  = 0;

  for (const u of toDelete) {
    const { error } = await supabase.auth.admin.deleteUser(u.id);
    if (error) {
      console.error(`  FAILED  ${u.email}  [${u.id}]: ${error.message}`);
      failed++;
    } else {
      console.log(`  DELETED ${u.email}  [${u.id}]`);
      deleted++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Deleted: ${deleted}  |  Failed: ${failed}`);
  if (failed > 0) console.warn('Some deletions failed — check errors above.');
}

main().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});

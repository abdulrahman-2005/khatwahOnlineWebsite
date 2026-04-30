const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_SERVICE_ROLE_API_KEY;
const adminEmails = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Creating app_settings table...');
  const { error: err1 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `
  });
  if (err1 && err1.code !== 'PGRST202') {
    // If exec_sql doesn't exist, we'll try a raw insert if the table already exists,
    // otherwise we might need to modify the RLS directly.
    console.log("Could not run exec_sql, trying direct insert...");
  }

  const { error: err2 } = await supabase.from('app_settings').upsert({
    key: 'super_admin_emails',
    value: adminEmails
  });

  if (err2) {
    console.error('Failed to update app_settings:', err2);
    // If the table doesn't exist, we must alter the is_super_admin function.
    console.log('Attempting to replace is_super_admin function directly...');
    // We cannot easily run DDL via the JS client without an RPC like exec_sql.
  } else {
    console.log('Successfully set super_admin_emails in app_settings.');
  }
}

run();

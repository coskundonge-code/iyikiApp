// apply-schema.js - Execute schema.sql against Supabase using Management API
// Usage: SUPABASE_ACCESS_TOKEN=sbp_xxx node apply-schema.js
const fs = require('fs');
const path = require('path');

const PAT = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'krjrwxldiabjqumvocsv';
const SCHEMA_FILE = path.join(__dirname, 'supabase', 'schema.sql');

if (!PAT) {
  console.error('ERROR: Set SUPABASE_ACCESS_TOKEN environment variable');
  console.error('Get your PAT from: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

async function runSchema() {
  const sql = fs.readFileSync(SCHEMA_FILE, 'utf8');
  
  console.log(`Executing schema against project: ${PROJECT_REF}`);
  console.log(`Schema file: ${SCHEMA_FILE}`);
  console.log(`SQL length: ${sql.length} chars`);
  
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  
  const text = await response.text();
  
  if (!response.ok) {
    console.error(`ERROR ${response.status}: ${text}`);
    process.exit(1);
  }
  
  console.log('SUCCESS! Schema applied.');
  try {
    console.log(JSON.parse(text));
  } catch {
    console.log(text);
  }
}

runSchema().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

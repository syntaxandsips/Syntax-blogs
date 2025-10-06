import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

const TEST_USER_EMAIL = 'test.admin@syntaxblogs.dev';
const TEST_USER_PASSWORD = 'TestAdmin123!';
const TEST_USER_DISPLAY_NAME = 'SyntaxBlogs Test Admin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug: Log environment variables (remove in production)
console.log('Environment variables loaded:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '***' : 'Not found');
console.log('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '***' : 'Not found');

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.');
}

if (!serviceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

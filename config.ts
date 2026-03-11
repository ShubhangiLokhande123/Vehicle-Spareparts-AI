// -----------------------------------------------------------------------------
// ⚙️ App Configuration
// -----------------------------------------------------------------------------
// IMPORTANT: Replace these placeholder values with your actual Supabase credentials.
// You can find these in your Supabase project's dashboard under Project Settings > API.

// 1. Go to your Supabase project dashboard.
// 2. Navigate to Project Settings > API.
// 3. Under "Project URL", copy the URL and paste it here.
// FIX: Explicitly type SUPABASE_URL as a string and trim whitespace.
// accessing process.env directly allows bundlers (Vite/Metro) to replace the value at build time.
export const SUPABASE_URL = "https://udayzbocnjzbhttkgmbt.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkYXl6Ym9jbmp6Ymh0dGtnbWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODgyOTYsImV4cCI6MjA4NjE2NDI5Nn0.64gK6_MAbpGPF4SizSAqigHUNLrda31MMWReh5lw6fQ";

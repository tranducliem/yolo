// Re-export browser client as default for backward compatibility.
// For new code, import directly from:
//   '@/lib/supabase/client'  — browser (use client)
//   '@/lib/supabase/server'  — server components, API routes
//   '@/lib/supabase/admin'   — service role, bypasses RLS
export { createClient } from "./supabase/client";

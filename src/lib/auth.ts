import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// Resolves the logged-in Supabase session to our public.User row (with
// role). Returns null when there's no session — callers decide how to
// redirect (e.g. /login vs. a same-page notice), since that varies by page.
// Extracted here because this sprint's new pages (register, payment,
// consent) each need it, on top of dashboard/page.tsx already doing the
// same lookup inline.
export async function getCurrentAppUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return prisma.user.findUnique({ where: { supabaseUid: user.id } });
}

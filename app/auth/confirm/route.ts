
import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/protected";

  const safeNext =
    next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/protected";

  const supabase = await createClient();

  // Handle the default Supabase ConfirmationURL (PKCE) flow.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      redirect(
        `/auth/error?error=${encodeURIComponent(error.message)}`
      );
    }

    redirect(`${origin}${safeNext}`);
  }

  // Also support the token_hash email template flow.
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      redirect(
        `/auth/error?error=${encodeURIComponent(error.message)}`
      );
    }

    redirect(`${origin}${safeNext}`);
  }

  redirect("/auth/error?error=Missing+confirmation+code");
}

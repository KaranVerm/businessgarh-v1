
"use server";

import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifyAdmin() {
  await connection();

  const supabase = await createClient();

  const {
    data,
    error: claimsError,
  } = await supabase.auth.getClaims();

  // Correct: claims are nested inside data.claims
  const userId = data?.claims?.sub;

  if (claimsError || !userId) {
    throw new Error("You must be logged in.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError || profile?.role !== "admin") {
    throw new Error("You are not authorized to perform this action.");
  }

  return {
    supabase,
    admin: createAdminClient(),
    adminId: userId,
  };
}

export async function suspendMember(
  memberId: string,
  reason: string
) {
  if (!memberId) {
    throw new Error("Member ID is required.");
  }

  const suspensionReason = reason?.trim();

  if (
    !suspensionReason ||
    suspensionReason.length > 500
  ) {
    throw new Error("Enter a valid suspension reason (maximum 500 characters).");
  }

  const { supabase, admin, adminId } = await verifyAdmin();

  if (memberId === adminId) {
    throw new Error("You cannot suspend your own account.");
  }

  const { data: member, error: memberError } = await supabase
    .from("profiles")
    .select("id, role, is_suspended")
    .eq("id", memberId)
    .single();

  if (memberError || !member) {
    throw new Error("Member not found.");
  }

  if (member.role === "admin") {
    throw new Error("You cannot suspend another admin.");
  }

  if (member.is_suspended) {
    throw new Error("This member is already suspended.");
  }

  const { error: banError } = await admin.auth.admin.updateUserById(
    memberId,
    { ban_duration: "876000h" }
  );

  if (banError) {
    throw new Error(`Account suspension failed: ${banError.message}`);
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      is_suspended: true,
      suspended_at: new Date().toISOString(),
      suspension_reason: suspensionReason,
    })
    .eq("id", memberId);

  if (updateError) {
    await admin.auth.admin.updateUserById(memberId, {
      ban_duration: "none",
    });

    throw new Error(`Profile update failed: ${updateError.message}`);
  }

  revalidatePath("/protected/admin");
  revalidatePath("/protected/admin/members");

  return {
    success: true,
    message: "Member suspended successfully.",
  };
}

export async function reactivateMember(memberId: string) {
  if (!memberId) {
    throw new Error("Member ID is required.");
  }

  const { supabase, admin, adminId } = await verifyAdmin();

  if (memberId === adminId) {
    throw new Error("You cannot reactivate your own account through this action.");
  }

  const { data: member, error: memberError } = await supabase
    .from("profiles")
    .select("id, role, is_suspended")
    .eq("id", memberId)
    .single();

  if (memberError || !member) {
    throw new Error("Member not found.");
  }

  if (member.role === "admin") {
    throw new Error("This action cannot be used on an admin account.");
  }

  if (!member.is_suspended) {
    throw new Error("This member is not currently suspended.");
  }

  const { error: unbanError } = await admin.auth.admin.updateUserById(
    memberId,
    { ban_duration: "none" }
  );

  if (unbanError) {
    throw new Error(`Account reactivation failed: ${unbanError.message}`);
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      is_suspended: false,
      suspended_at: null,
      suspension_reason: null,
    })
    .eq("id", memberId);

  if (updateError) {
    throw new Error(`Profile update failed: ${updateError.message}`);
  }

  revalidatePath("/protected/admin");
  revalidatePath("/protected/admin/members");

  return {
    success: true,
    message: "Member reactivated successfully.",
  };
}


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

// SUSPEND MEMBER
export async function suspendMember(
  memberId: string,
  reason: string
) {
  if (!memberId) {
    throw new Error("Member ID is required.");
  }

  const suspensionReason = reason?.trim();

  if (!suspensionReason || suspensionReason.length > 500) {
    throw new Error(
      "Enter a valid suspension reason (maximum 500 characters)."
    );
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
    throw new Error(
      `Account suspension failed: ${banError.message}`
    );
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

    throw new Error(
      `Profile update failed: ${updateError.message}`
    );
  }

  revalidatePath("/protected/admin");
  revalidatePath("/protected/admin/members");

  return {
    success: true,
    message: "Member suspended successfully.",
  };
}

// REACTIVATE MEMBER
export async function reactivateMember(memberId: string) {
  if (!memberId) {
    throw new Error("Member ID is required.");
  }

  const { supabase, admin, adminId } = await verifyAdmin();

  if (memberId === adminId) {
    throw new Error(
      "You cannot reactivate your own account through this action."
    );
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
    throw new Error(
      "This action cannot be used on an admin account."
    );
  }

  if (!member.is_suspended) {
    throw new Error("This member is not currently suspended.");
  }

  const { error: unbanError } = await admin.auth.admin.updateUserById(
    memberId,
    { ban_duration: "none" }
  );

  if (unbanError) {
    throw new Error(
      `Account reactivation failed: ${unbanError.message}`
    );
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
    throw new Error(
      `Profile update failed: ${updateError.message}`
    );
  }

  revalidatePath("/protected/admin");
  revalidatePath("/protected/admin/members");

  return {
    success: true,
    message: "Member reactivated successfully.",
  };
}

// PERMANENTLY DELETE MEMBER
export async function deleteMember(
  memberId: string,
  confirmationName: string
) {
  if (!memberId || !confirmationName?.trim()) {
    throw new Error(
      "Member ID and confirmation name are required."
    );
  }

  const { supabase, admin, adminId } = await verifyAdmin();

  // Prevent self-deletion.
  if (memberId === adminId) {
    throw new Error("You cannot delete your own account.");
  }

  // Verify the target member using the authenticated admin session.
  const { data: member, error: memberError } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", memberId)
    .single();

  if (memberError || !member) {
    throw new Error("Member not found.");
  }

  // Never delete an administrator through this action.
  if (member.role !== "member") {
    throw new Error(
      "Only regular member accounts can be deleted here."
    );
  }

  // Verify the typed confirmation name.
  if (
    !member.full_name ||
    member.full_name.trim().toLowerCase() !==
      confirmationName.trim().toLowerCase()
  ) {
    throw new Error("The confirmation name does not match.");
  }

  // Permanently delete the Auth account.
  // Your verified database foreign keys cascade to the profile,
  // messages, hosted events and event RSVPs.
  const { error: deleteError } =
    await admin.auth.admin.deleteUser(memberId);

  if (deleteError) {
    throw new Error(
      `Member deletion failed: ${deleteError.message}`
    );
  }

  // Auth deletion has succeeded. Now clean up this member's
  // files from their own UUID folder in the avatars bucket.
  let avatarWarning: string | null = null;

  const avatarPaths: string[] = [];
  const pageSize = 100;

  try {
    let offset = 0;

    while (true) {
      const { data: files, error: listError } =
        await admin.storage
          .from("avatars")
          .list(memberId, {
            limit: pageSize,
            offset,
          });

      if (listError) {
        throw listError;
      }

      const page = files ?? [];

      for (const file of page) {
        // Only include actual files, not nested folders.
        if (file.name && file.id) {
          avatarPaths.push(`${memberId}/${file.name}`);
        }
      }

      if (page.length < pageSize) {
        break;
      }

      offset += pageSize;
    }

    if (avatarPaths.length > 0) {
      const { error: storageError } = await admin.storage
        .from("avatars")
        .remove(avatarPaths);

      if (storageError) {
        throw storageError;
      }
    }
  } catch (error) {
    avatarWarning =
      error instanceof Error
        ? error.message
        : "Unknown avatar cleanup error.";
  }

  revalidatePath("/protected/admin");
  revalidatePath("/protected/admin/members");

  if (avatarWarning) {
    return {
      success: true,
      message:
        "Member account deleted, but avatar cleanup needs attention: " +
        avatarWarning,
    };
  }

  return {
    success: true,
    message: "Member account and avatar files deleted successfully.",
  };
}

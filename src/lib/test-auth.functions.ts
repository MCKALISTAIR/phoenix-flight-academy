import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TEST_USERS = {
  admin: {
    email: "admin@test.local",
    password: "TestAdmin123!",
    display_name: "Test Admin",
    role: "super_admin" as const,
  },
  user: {
    email: "user@test.local",
    password: "TestUser123!",
    display_name: "Test User",
    role: null,
  },
};

export const ensureTestUser = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ kind: z.enum(["admin", "user"]) }).parse(input),
  )
  .handler(async ({ data }) => {
    const cfg = TEST_USERS[data.kind];

    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) throw new Error(listErr.message);
    let user = list.users.find((u) => u.email === cfg.email);

    if (!user) {
      const { data: created, error: createErr } =
        await supabaseAdmin.auth.admin.createUser({
          email: cfg.email,
          password: cfg.password,
          email_confirm: true,
          user_metadata: { display_name: cfg.display_name },
        });
      if (createErr) throw new Error(createErr.message);
      user = created.user!;
    } else {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: cfg.password,
        email_confirm: true,
      });
    }

    if (cfg.role && user) {
      await supabaseAdmin
        .from("user_roles")
        .upsert(
          { user_id: user.id, role: cfg.role },
          { onConflict: "user_id,role" },
        );
    }

    return { email: cfg.email, password: cfg.password };
  });

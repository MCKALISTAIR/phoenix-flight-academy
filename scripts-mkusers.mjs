import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(url, key);

const users = [
  {
    email: "admin@test.local",
    password: "TestAdmin123!",
    role: "super_admin",
    display_name: "Test Admin",
  },
  {
    email: "user@test.local",
    password: "TestUser123!",
    role: null,
    display_name: "Test User",
  },
];

for (const u of users) {
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list.users.find((x) => x.email === u.email);
  if (existing) await admin.auth.admin.deleteUser(existing.id);
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { display_name: u.display_name },
  });
  if (error) {
    console.error(u.email, error);
    continue;
  }
  console.log("created", u.email, data.user.id);
  if (u.role) {
    const { error: re } = await admin
      .from("user_roles")
      .insert({ user_id: data.user.id, role: u.role });
    if (re) console.error("role err", re);
    else console.log("role", u.role);
  }
}

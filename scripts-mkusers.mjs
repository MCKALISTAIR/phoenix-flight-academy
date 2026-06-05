import { createClient } from '@supabase/supabase-js';
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(url, key);
const users = [
  { email: 'e2e-admin@test.lovable.dev', password: 'TestPass!2026', role: 'super_admin' },
  { email: 'e2e-user@test.lovable.dev', password: 'TestPass!2026', role: null },
];
for (const u of users) {
  // delete if exists
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list.users.find(x => x.email === u.email);
  if (existing) await admin.auth.admin.deleteUser(existing.id);
  const { data, error } = await admin.auth.admin.createUser({ email: u.email, password: u.password, email_confirm: true });
  if (error) { console.error(u.email, error); continue; }
  console.log('created', u.email, data.user.id);
  if (u.role) {
    const { error: re } = await admin.from('user_roles').insert({ user_id: data.user.id, role: u.role });
    if (re) console.error('role err', re); else console.log('role', u.role);
  }
}

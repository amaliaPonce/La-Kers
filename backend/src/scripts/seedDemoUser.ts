import { FREEMIUM_PLAN_ID } from '../config/plans';
import { supabaseAdmin } from '../config/supabaseClient';

const DEMO_EMAIL = process.env.DEMO_USER_EMAIL ?? 'owner@example.com';
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? 'password123';

const demoMetadata = {
  full_name: 'Usuario Demo',
  company_cif: 'B12345678',
  identification_type: 'cif',
  plan: FREEMIUM_PLAN_ID
};

async function findUserByEmail(email: string) {
  let page = 1;
  const perPage = 200;
  const normalized = email.toLowerCase();

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }

    const users = data?.users ?? [];
    const match = users.find((user) => String(user.email ?? '').toLowerCase() === normalized);
    if (match) {
      return match;
    }

    if (users.length < perPage) {
      return null;
    }

    page += 1;
  }
}

async function upsertDemoUser() {
  const existingUser = await findUserByEmail(DEMO_EMAIL);

  if (existingUser?.id) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: demoMetadata
    });

    if (error) {
      throw error;
    }

    return {
      action: 'updated',
      userId: data.user?.id ?? existingUser.id
    };
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: demoMetadata
  });

  if (error) {
    throw error;
  }

  return {
    action: 'created',
    userId: data.user?.id ?? ''
  };
}

upsertDemoUser()
  .then((result) => {
    console.log(`Demo user ${result.action}:`);
    console.log(`email=${DEMO_EMAIL}`);
    console.log(`password=${DEMO_PASSWORD}`);
    console.log(`user_id=${result.userId}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unable to seed demo user');
    console.error(error);
    process.exit(1);
  });

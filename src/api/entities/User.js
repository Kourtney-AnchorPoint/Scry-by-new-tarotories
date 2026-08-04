import { client } from '@/lib/amplifyClient';

// Base44's built-in User entity had no owner-scoped RLS — it queried the
// platform's own user table. There's no Amplify Data model equivalent
// (Cognito users aren't in DynamoDB), so list() calls the admin-only
// listUsers Lambda instead of a Data model.
export const User = {
  list: async (sort, limit) => {
    const { data, errors } = await client.queries.listUsers({});
    if (errors?.length) throw new Error(errors[0].message);
    let users = data?.users || [];
    if (sort) {
      const desc = sort.startsWith('-');
      const field = sort.replace(/^-/, '');
      users = [...users].sort((a, b) => {
        const av = a[field] ?? '';
        const bv = b[field] ?? '';
        if (av < bv) return desc ? 1 : -1;
        if (av > bv) return desc ? -1 : 1;
        return 0;
      });
    }
    return limit ? users.slice(0, limit) : users;
  },
};

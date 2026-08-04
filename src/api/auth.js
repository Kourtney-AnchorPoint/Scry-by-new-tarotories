import { getCurrentUser, fetchUserAttributes, fetchAuthSession, signOut } from 'aws-amplify/auth';

export const auth = {
  me: async () => {
    const [user, attributes, session] = await Promise.all([
      getCurrentUser(),
      fetchUserAttributes(),
      fetchAuthSession(),
    ]);
    const groups = session.tokens?.accessToken?.payload['cognito:groups'] || [];
    return {
      id: user.userId,
      email: attributes.email || '',
      full_name: attributes.name || attributes.email || '',
      role: groups.includes('Admins') ? 'admin' : 'user',
    };
  },
  logout: async (redirectUrl) => {
    await signOut();
    if (redirectUrl) window.location.href = redirectUrl;
  },
  redirectToLogin: (returnUrl) => {
    if (returnUrl) sessionStorage.setItem('post_login_redirect', returnUrl);
    window.location.href = '/login';
  },
  isAuthenticated: async () => {
    try {
      const session = await fetchAuthSession();
      return !!session.tokens;
    } catch {
      return false;
    }
  },
};
